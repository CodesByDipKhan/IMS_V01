import { Repository } from 'typeorm';
import { Student } from '../entities/student.entity';
import { Sequence } from '../entities/sequence.entity';
import { Invoice } from '../entities/invoice.entity';
import { Country } from '../entities/country.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
export declare class StudentsService {
    private studentsRepository;
    private sequencesRepository;
    private invoicesRepository;
    private countriesRepository;
    constructor(studentsRepository: Repository<Student>, sequencesRepository: Repository<Sequence>, invoicesRepository: Repository<Invoice>, countriesRepository: Repository<Country>);
    private getPrefix;
    create(createStudentDto: CreateStudentDto): Promise<Student>;
    findAll(name?: string, invoiceId?: string): Promise<any[]>;
    findOne(id: number): Promise<any>;
    update(id: number, updateStudentDto: UpdateStudentDto): Promise<Student>;
}
