import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';

import { User } from './entities/user.entity';
import { Employee } from './entities/employee.entity';
import { Counselor } from './entities/counselor.entity';
import { Country } from './entities/country.entity';
import { Sequence } from './entities/sequence.entity';
import { Student } from './entities/student.entity';
import { Invoice } from './entities/invoice.entity';

import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { EmployeesModule } from './employees/employees.module';
import { CounselorsModule } from './counselors/counselors.module';
import { CountriesModule } from './countries/countries.module';
import { CurrencyModule } from './currency/currency.module';
import { StudentsModule } from './students/students.module';
import { InvoicesModule } from './invoices/invoices.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [User, Employee, Counselor, Country, Sequence, Student, Invoice],
        synchronize: true, // Seamless table creation on launch
      }),
    }),
    AuthModule,
    EmployeesModule,
    CounselorsModule,
    CountriesModule,
    CurrencyModule,
    StudentsModule,
    InvoicesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
