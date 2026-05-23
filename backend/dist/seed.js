"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("./entities/user.entity");
const country_entity_1 = require("./entities/country.entity");
const employee_entity_1 = require("./entities/employee.entity");
const counselor_entity_1 = require("./entities/counselor.entity");
const bcrypt = __importStar(require("bcrypt"));
async function seed() {
    console.log('Bootstrapping NestJS application context for seeding...');
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    try {
        const userRepository = app.get((0, typeorm_1.getRepositoryToken)(user_entity_1.User));
        const countryRepository = app.get((0, typeorm_1.getRepositoryToken)(country_entity_1.Country));
        const employeeRepository = app.get((0, typeorm_1.getRepositoryToken)(employee_entity_1.Employee));
        const counselorRepository = app.get((0, typeorm_1.getRepositoryToken)(counselor_entity_1.Counselor));
        console.log('Seeding Users...');
        const adminExists = await userRepository.findOne({ where: { username: 'admin' } });
        if (!adminExists) {
            const hashedPassword = await bcrypt.hash('Admin@123', 10);
            await userRepository.save(userRepository.create({ username: 'admin', password: hashedPassword }));
            console.log('✓ Seeding User: admin / Admin@123 completed');
        }
        else {
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
            }
            else {
                console.log(`✓ Country: ${c.name} already exists`);
            }
        }
        console.log('Seeding Employees...');
        const employeesData = ['Nipa', 'Samia', 'Nadia'];
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
            }
            else {
                console.log(`✓ Employee: ${empName} already exists`);
            }
        }
        console.log('Seeding Counselors...');
        const counselorsData = ['Rasmul', 'Fahim', 'Nowrose', 'Mustafiz', 'Khushbu'];
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
            }
            else {
                console.log(`✓ Counselor: ${cName} already exists`);
            }
        }
        console.log('✓ Database Seeding completed successfully!');
    }
    catch (error) {
        console.error('Seeding failed:', error);
    }
    finally {
        await app.close();
    }
}
seed();
//# sourceMappingURL=seed.js.map