import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from '../entities/invoice.entity';
import { Student } from '../entities/student.entity';
import { Sequence } from '../entities/sequence.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { PdfService } from './pdf.service';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class InvoicesService {
  private pdfStoragePath: string;

  constructor(
    @InjectRepository(Invoice)
    private invoicesRepository: Repository<Invoice>,
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
    @InjectRepository(Sequence)
    private sequencesRepository: Repository<Sequence>,
    private pdfService: PdfService,
    configService: ConfigService,
  ) {
    this.pdfStoragePath = configService.get<string>('PDF_STORAGE_PATH') || 'storage/invoices';
  }

  async create(createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    // 1. Fetch related Student record
    const student = await this.studentsRepository.findOne({
      where: { id: createInvoiceDto.student_id },
    });
    if (!student) {
      throw new NotFoundException(`Student with ID ${createInvoiceDto.student_id} not found.`);
    }

    // 2. Fetch the latest invoice of this student to calculate previous due
    const latestInvoice = await this.invoicesRepository.findOne({
      where: { student_id: student.id },
      order: { id: 'DESC' },
    });
    const previousDue = latestInvoice ? latestInvoice.due_amount_bdt : student.file_opening_fee_bdt;

    // 3. Calculate Total and Due BDT amounts
    const totalAmount = previousDue + createInvoiceDto.application_fee_bdt;

    // Guard: paid amount must not exceed total amount
    if (createInvoiceDto.paid_amount_bdt > totalAmount) {
      throw new BadRequestException(
        `Paid amount (${createInvoiceDto.paid_amount_bdt}) cannot exceed total amount (${totalAmount}).`
      );
    }

    const dueAmount = totalAmount - createInvoiceDto.paid_amount_bdt;

    // 4. Global auto-incrementing invoice ID sequence (format: NextEd/INV/{number})
    let seq = await this.sequencesRepository.findOne({ where: { key: 'invoice_id' } });
    if (!seq) {
      seq = this.sequencesRepository.create({ key: 'invoice_id', value: 1 });
    } else {
      seq.value += 1;
    }
    await this.sequencesRepository.save(seq);

    const invoiceId = `NextEd/INV/${seq.value}`;

    // 5. Replace forward slashes with underscores for safe file names
    const safeInvoiceId = invoiceId.replace(/\//g, '_');
    const pdfFilename = `${safeInvoiceId}.pdf`;
    const pdfPath = path.join(this.pdfStoragePath, pdfFilename);

    // 6. Create and save the Database Invoice record
    const invoice = this.invoicesRepository.create({
      ...createInvoiceDto,
      invoice_id: invoiceId,
      total_amount_bdt: totalAmount,
      due_amount_bdt: dueAmount,
      pdf_path: pdfPath,
    });

    const savedInvoice = await this.invoicesRepository.save(invoice);

    // Fetch the invoice with relations loaded for pdf layout rendering
    const populatedInvoice = await this.invoicesRepository.findOne({
      where: { id: savedInvoice.id },
      relations: { country: true },
    });

    // 7. Trigger Puppeteer PDF generation
    try {
      await this.pdfService.generateInvoicePdf(
        populatedInvoice,
        student.name,
        student.phone_country_code,
        student.phone_number,
        student.file_opening_fee_bdt,
        pdfPath,
      );
    } catch (e) {
      console.error('Puppeteer invoice PDF compilation failed. DB entry created but PDF file is missing:', e);
    }

    return savedInvoice;
  }

  async findAll(invoiceId?: string): Promise<any[]> {
    const qb = this.invoicesRepository.createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.student', 'student')
      .leftJoinAndSelect('invoice.country', 'country');

    if (invoiceId) {
      qb.andWhere('invoice.invoice_id ILIKE :invoiceId', { invoiceId: `%${invoiceId}%` });
    }

    qb.orderBy('invoice.created_at', 'DESC');
    const invoices = await qb.getMany();

    return invoices.map(inv => ({
      id: inv.id,
      invoice_id: inv.invoice_id,
      studentName: inv.student ? inv.student.name : 'Unknown Student',
      created_at: inv.created_at,
      pdf_path: inv.pdf_path,
    }));
  }

  async findOne(id: number): Promise<Invoice> {
    const invoice = await this.invoicesRepository.findOne({
      where: { id },
      relations: { student: true, country: true },
    });
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found.`);
    }
    return invoice;
  }

  async getPdfPath(id: number): Promise<string> {
    const invoice = await this.findOne(id);
    if (!invoice.pdf_path || !fs.existsSync(invoice.pdf_path)) {
      throw new NotFoundException(`Invoice file for registration number ${invoice.invoice_id} not found on the local disk.`);
    }
    return invoice.pdf_path;
  }
}
