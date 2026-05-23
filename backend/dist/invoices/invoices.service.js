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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoicesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const invoice_entity_1 = require("../entities/invoice.entity");
const student_entity_1 = require("../entities/student.entity");
const sequence_entity_1 = require("../entities/sequence.entity");
const pdf_service_1 = require("./pdf.service");
const config_1 = require("@nestjs/config");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
let InvoicesService = class InvoicesService {
    invoicesRepository;
    studentsRepository;
    sequencesRepository;
    pdfService;
    pdfStoragePath;
    constructor(invoicesRepository, studentsRepository, sequencesRepository, pdfService, configService) {
        this.invoicesRepository = invoicesRepository;
        this.studentsRepository = studentsRepository;
        this.sequencesRepository = sequencesRepository;
        this.pdfService = pdfService;
        this.pdfStoragePath = configService.get('PDF_STORAGE_PATH') || 'storage/invoices';
    }
    async create(createInvoiceDto) {
        const student = await this.studentsRepository.findOne({
            where: { id: createInvoiceDto.student_id },
        });
        if (!student) {
            throw new common_1.NotFoundException(`Student with ID ${createInvoiceDto.student_id} not found.`);
        }
        const totalAmount = student.file_opening_fee_bdt + student.application_fee_bdt;
        const dueAmount = totalAmount - createInvoiceDto.paid_amount_bdt;
        let seq = await this.sequencesRepository.findOne({ where: { key: 'invoice_id' } });
        if (!seq) {
            seq = this.sequencesRepository.create({ key: 'invoice_id', value: 1 });
        }
        else {
            seq.value += 1;
        }
        await this.sequencesRepository.save(seq);
        const paddedSeq = seq.value <= 99
            ? String(seq.value).padStart(2, '0')
            : String(seq.value);
        const invoiceId = `NextEd/${paddedSeq}`;
        const safeInvoiceId = invoiceId.replace(/\//g, '_');
        const pdfFilename = `${safeInvoiceId}.pdf`;
        const pdfPath = path.join(this.pdfStoragePath, pdfFilename);
        const invoice = this.invoicesRepository.create({
            ...createInvoiceDto,
            invoice_id: invoiceId,
            total_amount_bdt: totalAmount,
            due_amount_bdt: dueAmount,
            pdf_path: pdfPath,
        });
        const savedInvoice = await this.invoicesRepository.save(invoice);
        try {
            await this.pdfService.generateInvoicePdf(savedInvoice, student.name, pdfPath);
        }
        catch (e) {
            console.error('Puppeteer invoice PDF compilation failed. DB entry created but PDF file is missing:', e);
        }
        return savedInvoice;
    }
    async findAll(invoiceId) {
        const qb = this.invoicesRepository.createQueryBuilder('invoice')
            .leftJoinAndSelect('invoice.student', 'student');
        if (invoiceId) {
            qb.andWhere('invoice.invoice_id ILIKE :invoiceId', { invoiceId: `%${invoiceId}%` });
        }
        qb.orderBy('invoice.created_at', 'DESC');
        const invoices = await qb.getMany();
        return invoices.map(inv => ({
            id: inv.id,
            invoice_id: inv.invoice_id,
            studentName: inv.student ? inv.student.name : 'Unknown Student',
            created_at: inv.created_at,
            pdf_path: inv.pdf_path,
        }));
    }
    async findOne(id) {
        const invoice = await this.invoicesRepository.findOne({
            where: { id },
            relations: { student: true },
        });
        if (!invoice) {
            throw new common_1.NotFoundException(`Invoice with ID ${id} not found.`);
        }
        return invoice;
    }
    async getPdfPath(id) {
        const invoice = await this.findOne(id);
        if (!invoice.pdf_path || !fs.existsSync(invoice.pdf_path)) {
            throw new common_1.NotFoundException(`Invoice file for registration number ${invoice.invoice_id} not found on the local disk.`);
        }
        return invoice.pdf_path;
    }
};
exports.InvoicesService = InvoicesService;
exports.InvoicesService = InvoicesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(invoice_entity_1.Invoice)),
    __param(1, (0, typeorm_1.InjectRepository)(student_entity_1.Student)),
    __param(2, (0, typeorm_1.InjectRepository)(sequence_entity_1.Sequence)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        pdf_service_1.PdfService,
        config_1.ConfigService])
], InvoicesService);
//# sourceMappingURL=invoices.service.js.map