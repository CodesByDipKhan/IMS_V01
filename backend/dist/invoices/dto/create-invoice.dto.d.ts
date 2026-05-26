export declare class CreateInvoiceDto {
    student_id: number;
    payer_name: string;
    payer_phone_country_code: string;
    payer_phone_number: string;
    payment_method: string;
    payment_detail?: string;
    bank_name?: string;
    country_id?: number;
    application_fee_bdt?: number;
    other_fee_bdt?: number;
    comment?: string;
    paid_amount_bdt: number;
}
