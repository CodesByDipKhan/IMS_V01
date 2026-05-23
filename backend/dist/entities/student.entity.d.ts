import { Country } from './country.entity';
export declare class Student {
    id: number;
    student_id: string;
    name: string;
    phone_country_code: string;
    phone_number: string;
    email: string;
    counselor_name: string;
    source_type: string;
    source_name: string;
    date_of_opening: Date;
    file_opening_fee_bdt: number;
    country_id: number;
    country: Country;
    application_fee_foreign: number;
    application_fee_bdt: number;
    exchange_rate_used: number;
    created_at: Date;
}
