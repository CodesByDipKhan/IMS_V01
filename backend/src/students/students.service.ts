import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../entities/student.entity';
import { Sequence } from '../entities/sequence.entity';
import { Invoice } from '../entities/invoice.entity';
import { Country } from '../entities/country.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
    @InjectRepository(Sequence)
    private sequencesRepository: Repository<Sequence>,
    @InjectRepository(Invoice)
    private invoicesRepository: Repository<Invoice>,
    @InjectRepository(Country)
    private countriesRepository: Repository<Country>,
  ) {}

  private getPrefix(name: string): string {
    if (!name) return 'Xxx';
    // Remove non-alphabetical characters and get first 3 characters
    const cleanName = name.replace(/[^a-zA-Z]/g, '');
    const part = cleanName.substring(0, 3);
    if (part.length === 0) return 'Xxx';
    // Capitalize first letter, lower case the rest
    return part.charAt(0).toUpperCase() + part.substring(1).toLowerCase();
  }

  async create(createStudentDto: CreateStudentDto): Promise<Student> {
    // 1. Generate Counselor and Source prefix
    const sourcePrefix = this.getPrefix(createStudentDto.source_name);
    const counselorPrefix = this.getPrefix(createStudentDto.counselor_name);

    // 2. Safely increment sequence value in a dedicated sequence tracker
    let seq = await this.sequencesRepository.findOne({ where: { key: 'student_id' } });
    if (!seq) {
      seq = this.sequencesRepository.create({ key: 'student_id', value: 1 });
    } else {
      seq.value += 1;
    }
    await this.sequencesRepository.save(seq);

    // 3. Format sequence number zero-padded to 3 digits (e.g. 001, 002... 999, 1000)
    const paddedNumber = seq.value <= 999 
      ? String(seq.value).padStart(3, '0') 
      : String(seq.value);

    const generatedStudentId = `NextEd/${sourcePrefix}/${counselorPrefix}/${paddedNumber}`;

    // 4. Save and return student
    const student = this.studentsRepository.create({
      ...createStudentDto,
      student_id: generatedStudentId,
      date_of_opening: new Date(createStudentDto.date_of_opening),
    });

    return this.studentsRepository.save(student);
  }

  async findAll(name?: string, invoiceId?: string): Promise<any[]> {
    const qb = this.studentsRepository.createQueryBuilder('student')
      .leftJoinAndSelect('student.country', 'country');

    if (name) {
      qb.andWhere('student.name ILIKE :name', { name: `%${name}%` });
    }

    if (invoiceId) {
      qb.innerJoin('invoices', 'invoice', 'invoice.student_id = student.id')
        .andWhere('invoice.invoice_id ILIKE :invoiceId', { invoiceId: `%${invoiceId}%` });
    }

    qb.orderBy('student.created_at', 'DESC');
    const students = await qb.getMany();

    // Map to include invoice count
    const results = await Promise.all(
      students.map(async (student) => {
        const invoiceCount = await this.invoicesRepository.count({
          where: { student_id: student.id },
        });
        return {
          id: student.id,
          student_id: student.student_id,
          name: student.name,
          phone_country_code: student.phone_country_code,
          phone_number: student.phone_number,
          invoiceCount,
        };
      })
    );

    return results;
  }

  async findOne(id: number): Promise<any> {
    const student = await this.studentsRepository.findOne({
      where: { id },
      relations: { country: true },
    });
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found.`);
    }

    // Load full invoice history for details
    const invoices = await this.invoicesRepository.find({
      where: { student_id: student.id },
      order: { created_at: 'DESC' },
    });

    return {
      ...student,
      invoices,
    };
  }

  async update(id: number, updateStudentDto: UpdateStudentDto): Promise<Student> {
    const student = await this.studentsRepository.findOne({ where: { id } });
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found.`);
    }

    Object.assign(student, updateStudentDto);
    return this.studentsRepository.save(student);
  }
}
