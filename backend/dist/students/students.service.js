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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const student_entity_1 = require("../entities/student.entity");
const sequence_entity_1 = require("../entities/sequence.entity");
const invoice_entity_1 = require("../entities/invoice.entity");
const country_entity_1 = require("../entities/country.entity");
let StudentsService = class StudentsService {
    studentsRepository;
    sequencesRepository;
    invoicesRepository;
    countriesRepository;
    constructor(studentsRepository, sequencesRepository, invoicesRepository, countriesRepository) {
        this.studentsRepository = studentsRepository;
        this.sequencesRepository = sequencesRepository;
        this.invoicesRepository = invoicesRepository;
        this.countriesRepository = countriesRepository;
    }
    getPrefix(name) {
        if (!name)
            return 'Xxx';
        const cleanName = name.replace(/[^a-zA-Z]/g, '');
        const part = cleanName.substring(0, 3);
        if (part.length === 0)
            return 'Xxx';
        return part.charAt(0).toUpperCase() + part.substring(1).toLowerCase();
    }
    async create(createStudentDto) {
        const sourcePrefix = this.getPrefix(createStudentDto.source_name);
        const counselorPrefix = this.getPrefix(createStudentDto.counselor_name);
        let seq = await this.sequencesRepository.findOne({ where: { key: 'student_id' } });
        if (!seq) {
            seq = this.sequencesRepository.create({ key: 'student_id', value: 1 });
        }
        else {
            seq.value += 1;
        }
        await this.sequencesRepository.save(seq);
        const paddedNumber = seq.value <= 999
            ? String(seq.value).padStart(3, '0')
            : String(seq.value);
        const generatedStudentId = `NextEd/${sourcePrefix}/${counselorPrefix}/${paddedNumber}`;
        const student = this.studentsRepository.create({
            ...createStudentDto,
            student_id: generatedStudentId,
            date_of_opening: new Date(createStudentDto.date_of_opening),
        });
        return this.studentsRepository.save(student);
    }
    async findAll(name, invoiceId) {
        const qb = this.studentsRepository.createQueryBuilder('student')
            .leftJoinAndSelect('student.country', 'country');
        if (name) {
            qb.andWhere('student.name ILIKE :name', { name: `%${name}%` });
        }
        if (invoiceId) {
            qb.innerJoin('invoices', 'invoice', 'invoice.student_id = student.id')
                .andWhere('invoice.invoice_id ILIKE :invoiceId', { invoiceId: `%${invoiceId}%` });
        }
        qb.orderBy('student.created_at', 'DESC');
        const students = await qb.getMany();
        const results = await Promise.all(students.map(async (student) => {
            const invoiceCount = await this.invoicesRepository.count({
                where: { student_id: student.id },
            });
            return {
                id: student.id,
                student_id: student.student_id,
                name: student.name,
                phone_country_code: student.phone_country_code,
                phone_number: student.phone_number,
                invoiceCount,
            };
        }));
        return results;
    }
    async findOne(id) {
        const student = await this.studentsRepository.findOne({
            where: { id },
            relations: { country: true },
        });
        if (!student) {
            throw new common_1.NotFoundException(`Student with ID ${id} not found.`);
        }
        const invoices = await this.invoicesRepository.find({
            where: { student_id: student.id },
            order: { id: 'DESC' },
            relations: { country: true },
        });
        const latestInvoice = invoices.length > 0 ? invoices[0] : null;
        const previous_due = latestInvoice
            ? latestInvoice.due_amount_bdt
            : student.file_opening_fee_bdt;
        return {
            ...student,
            invoices,
            previous_due,
        };
    }
    async update(id, updateStudentDto) {
        const student = await this.studentsRepository.findOne({ where: { id } });
        if (!student) {
            throw new common_1.NotFoundException(`Student with ID ${id} not found.`);
        }
        Object.assign(student, updateStudentDto);
        return this.studentsRepository.save(student);
    }
};
exports.StudentsService = StudentsService;
exports.StudentsService = StudentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(student_entity_1.Student)),
    __param(1, (0, typeorm_1.InjectRepository)(sequence_entity_1.Sequence)),
    __param(2, (0, typeorm_1.InjectRepository)(invoice_entity_1.Invoice)),
    __param(3, (0, typeorm_1.InjectRepository)(country_entity_1.Country)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], StudentsService);
//# sourceMappingURL=students.service.js.map