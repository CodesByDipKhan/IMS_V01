import { Repository } from 'typeorm';
import { Employee } from '../entities/employee.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
export declare class EmployeesService {
    private employeesRepository;
    constructor(employeesRepository: Repository<Employee>);
    findAll(): Promise<Employee[]>;
    create(createEmployeeDto: CreateEmployeeDto): Promise<Employee>;
    remove(id: number): Promise<void>;
}
