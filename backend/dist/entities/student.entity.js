"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Student = void 0;
const typeorm_1 = require("typeorm");
const country_entity_1 = require("./country.entity");
let Student = class Student {
    id;
    student_id;
    name;
    phone_country_code;
    phone_number;
    email;
    counselor_name;
    source_type;
    source_name;
    date_of_opening;
    file_opening_fee_bdt;
    country_id;
    country;
    application_fee_foreign;
    application_fee_bdt;
    exchange_rate_used;
    created_at;
};
exports.Student = Student;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Student.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Student.prototype, "student_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Student.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Student.prototype, "phone_country_code", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Student.prototype, "phone_number", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Student.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Student.prototype, "counselor_name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Student.prototype, "source_type", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Student.prototype, "source_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], Student.prototype, "date_of_opening", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 12, scale: 2, transformer: {
            to: (value) => value,
            from: (value) => parseFloat(value)
        } }),
    __metadata("design:type", Number)
], Student.prototype, "file_opening_fee_bdt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Student.prototype, "country_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => country_entity_1.Country),
    (0, typeorm_1.JoinColumn)({ name: 'country_id' }),
    __metadata("design:type", country_entity_1.Country)
], Student.prototype, "country", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2, transformer: {
            to: (value) => value,
            from: (value) => parseFloat(value)
        } }),
    __metadata("design:type", Number)
], Student.prototype, "application_fee_foreign", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 12, scale: 2, transformer: {
            to: (value) => value,
            from: (value) => parseFloat(value)
        } }),
    __metadata("design:type", Number)
], Student.prototype, "application_fee_bdt", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 4, transformer: {
            to: (value) => value,
            from: (value) => parseFloat(value)
        } }),
    __metadata("design:type", Number)
], Student.prototype, "exchange_rate_used", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Student.prototype, "created_at", void 0);
exports.Student = Student = __decorate([
    (0, typeorm_1.Entity)('students')
], Student);
//# sourceMappingURL=student.entity.js.map