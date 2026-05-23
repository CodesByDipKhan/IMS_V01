import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { Employee } from '../entities/employee.entity';
export declare class EmployeesController {
    private readonly employeesService;
    constructor(employeesService: EmployeesService);
    findAll(): Promise<Employee[]>;
    create(createEmployeeDto: CreateEmployeeDto): Promise<Employee>;
    remove(id: number): Promise<void>;
}
