import { Controller, Get, Post, Patch, Body, Query, Param, ParseIntPipe } from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Student } from '../entities/student.entity';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  async create(@Body() createStudentDto: CreateStudentDto): Promise<Student> {
    return this.studentsService.create(createStudentDto);
  }

  @Get()
  async findAll(
    @Query('name') name?: string,
    @Query('invoice_id') invoiceId?: string,
  ): Promise<any[]> {
    return this.studentsService.findAll(name, invoiceId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.studentsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStudentDto: UpdateStudentDto,
  ): Promise<Student> {
    return this.studentsService.update(id, updateStudentDto);
  }
}
