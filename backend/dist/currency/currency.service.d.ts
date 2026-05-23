import { ConfigService } from '@nestjs/config';
export declare class CurrencyService {
    private apiKey?;
    constructor(configService: ConfigService);
    convertToBdt(from: string, amount: number): Promise<{
        rate: number;
        converted_bdt: number;
        source_currency: string;
        amount: number;
    }>;
}
