import { CurrencyService } from './currency.service';
export declare class CurrencyController {
    private readonly currencyService;
    constructor(currencyService: CurrencyService);
    convert(from: string, amount: number, date?: string): Promise<{
        rate: number;
        converted_bdt: number;
        source_currency: string;
        amount: number;
    }>;
}
