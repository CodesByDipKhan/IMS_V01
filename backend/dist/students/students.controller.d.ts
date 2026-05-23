import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Student } from '../entities/student.entity';
export declare class StudentsController {
    private readonly studentsService;
    constructor(studentsService: StudentsService);
    create(createStudentDto: CreateStudentDto): Promise<Student>;
    findAll(name?: string, invoiceId?: string): Promise<any[]>;
    findOne(id: number): Promise<any>;
    update(id: number, updateStudentDto: UpdateStudentDto): Promise<Student>;
}
