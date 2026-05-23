"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const core_1 = require("@nestjs/core");
const user_entity_1 = require("./entities/user.entity");
const employee_entity_1 = require("./entities/employee.entity");
const counselor_entity_1 = require("./entities/counselor.entity");
const country_entity_1 = require("./entities/country.entity");
const sequence_entity_1 = require("./entities/sequence.entity");
const student_entity_1 = require("./entities/student.entity");
const invoice_entity_1 = require("./entities/invoice.entity");
const auth_module_1 = require("./auth/auth.module");
const jwt_auth_guard_1 = require("./auth/jwt-auth.guard");
const employees_module_1 = require("./employees/employees.module");
const counselors_module_1 = require("./counselors/counselors.module");
const countries_module_1 = require("./countries/countries.module");
const currency_module_1 = require("./currency/currency.module");
const students_module_1 = require("./students/students.module");
const invoices_module_1 = require("./invoices/invoices.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('DB_HOST'),
                    port: configService.get('DB_PORT'),
                    username: configService.get('DB_USERNAME'),
                    password: configService.get('DB_PASSWORD'),
                    database: configService.get('DB_NAME'),
                    entities: [user_entity_1.User, employee_entity_1.Employee, counselor_entity_1.Counselor, country_entity_1.Country, sequence_entity_1.Sequence, student_entity_1.Student, invoice_entity_1.Invoice],
                    synchronize: true,
                }),
            }),
            auth_module_1.AuthModule,
            employees_module_1.EmployeesModule,
            counselors_module_1.CounselorsModule,
            countries_module_1.CountriesModule,
            currency_module_1.CurrencyModule,
            students_module_1.StudentsModule,
            invoices_module_1.InvoicesModule,
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map