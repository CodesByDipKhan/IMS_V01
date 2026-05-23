import { Repository } from 'typeorm';
import { Invoice } from '../entities/invoice.entity';
import { Student } from '../entities/student.entity';
import { Sequence } from '../entities/sequence.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { PdfService } from './pdf.service';
import { ConfigService } from '@nestjs/config';
export declare class InvoicesService {
    private invoicesRepository;
    private studentsRepository;
    private sequencesRepository;
    private pdfService;
    private pdfStoragePath;
    constructor(invoicesRepository: Repository<Invoice>, studentsRepository: Repository<Student>, sequencesRepository: Repository<Sequence>, pdfService: PdfService, configService: ConfigService);
    create(createInvoiceDto: CreateInvoiceDto): Promise<Invoice>;
    findAll(invoiceId?: string): Promise<any[]>;
    findOne(id: number): Promise<Invoice>;
    getPdfPath(id: number): Promise<string>;
}
