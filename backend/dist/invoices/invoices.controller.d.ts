import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
export declare class InvoicesController {
    private readonly invoicesService;
    constructor(invoicesService: InvoicesService);
    create(createInvoiceDto: CreateInvoiceDto): Promise<import("../entities/invoice.entity").Invoice>;
    findAll(invoiceId?: string): Promise<any[]>;
    findOne(id: number): Promise<import("../entities/invoice.entity").Invoice>;
    getPdf(id: number, res: any): Promise<void>;
}
