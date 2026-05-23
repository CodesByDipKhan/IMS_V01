import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from '../entities/student.entity';
import { Sequence } from '../entities/sequence.entity';
import { Invoice } from '../entities/invoice.entity';
import { Country } from '../entities/country.entity';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student, Sequence, Invoice, Country]),
  ],
  providers: [StudentsService],
  controllers: [StudentsController],
  exports: [StudentsService],
})
export class StudentsModule {}
