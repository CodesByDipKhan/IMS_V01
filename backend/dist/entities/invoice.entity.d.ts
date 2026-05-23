import { Student } from './student.entity';
export declare class Invoice {
    id: number;
    invoice_id: string;
    student_id: number;
    student: Student;
    payer_name: string;
    payer_phone_country_code: string;
    payer_phone_number: string;
    payment_method: string;
    payment_detail: string;
    bank_name: string;
    total_amount_bdt: number;
    paid_amount_bdt: number;
    due_amount_bdt: number;
    pdf_path: string;
    created_at: Date;
}
