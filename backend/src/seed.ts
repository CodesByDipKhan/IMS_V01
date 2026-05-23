import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Country } from './entities/country.entity';
import { Employee } from './entities/employee.entity';
import { Counselor } from './entities/counselor.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

async function seed() {
  console.log('Bootstrapping NestJS application context for seeding...');
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const userRepository = app.get<Repository<User>>(getRepositoryToken(User));
    const countryRepository = app.get<Repository<Country>>(getRepositoryToken(Country));
    const employeeRepository = app.get<Repository<Employee>>(getRepositoryToken(Employee));
    const counselorRepository = app.get<Repository<Counselor>>(getRepositoryToken(Counselor));

    console.log('Seeding Users...');
    const adminExists = await userRepository.findOne({ where: { username: 'admin' } });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      await userRepository.save(
        userRepository.create({ username: 'admin', password: hashedPassword })
      );
      console.log('✓ Seeding User: admin / Admin@123 completed');
    } else {
      console.log('✓ User admin already exists');
    }

    console.log('Seeding Countries...');
    const countriesData = [
      { name: 'USA', currency_code: 'USD', currency_symbol: '$', application_fee: 15 },
      { name: 'Canada', currency_code: 'CAD', currency_symbol: 'CA$', application_fee: 20 },
      { name: 'Australia', currency_code: 'AUD', currency_symbol: 'A$', application_fee: 10 },
      { name: 'UK', currency_code: 'GBP', currency_symbol: '£', application_fee: 25 },
      { name: 'Germany', currency_code: 'EUR', currency_symbol: '€', application_fee: 20 },
      { name: 'New Zealand', currency_code: 'NZD', currency_symbol: 'NZ$', application_fee: 18 },
    ];

    for (const c of countriesData) {
      const exists = await countryRepository.findOne({ where: { name: c.name } });
      if (!exists) {
        await countryRepository.save(countryRepository.create(c));
        console.log(`✓ Country: ${c.name} seeded`);
      } else {
        console.log(`✓ Country: ${c.name} already exists`);
      }
    }

    console.log('Seeding Employees...');
    const employeesData = ['Nipa', 'Samia', 'Nadia'];

    // Clean up any old seeded employees not in the new list
    const allExistingEmployees = await employeeRepository.find();
    for (const emp of allExistingEmployees) {
      if (!employeesData.includes(emp.name)) {
        await employeeRepository.delete(emp.id);
        console.log(`✗ Removed old Employee: ${emp.name}`);
      }
    }

    for (const empName of employeesData) {
      const exists = await employeeRepository.findOne({ where: { name: empName } });
      if (!exists) {
        await employeeRepository.save(employeeRepository.create({ name: empName }));
        console.log(`✓ Employee: ${empName} seeded`);
      } else {
        console.log(`✓ Employee: ${empName} already exists`);
      }
    }

    console.log('Seeding Counselors...');
    const counselorsData = ['Rasmul', 'Fahim', 'Nowrose', 'Mustafiz', 'Khushbu'];

    // Clean up any old seeded counselors not in the new list
    const allExistingCounselors = await counselorRepository.find();
    for (const c of allExistingCounselors) {
      if (!counselorsData.includes(c.name)) {
        await counselorRepository.delete(c.id);
        console.log(`✗ Removed old Counselor: ${c.name}`);
      }
    }

    for (const cName of counselorsData) {
      const exists = await counselorRepository.findOne({ where: { name: cName } });
      if (!exists) {
        await counselorRepository.save(counselorRepository.create({ name: cName }));
        console.log(`✓ Counselor: ${cName} seeded`);
      } else {
        console.log(`✓ Counselor: ${cName} already exists`);
      }
    }

    console.log('✓ Database Seeding completed successfully!');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await app.close();
  }
}

seed();
