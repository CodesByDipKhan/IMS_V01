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
exports.CurrencyService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let CurrencyService = class CurrencyService {
    apiKey;
    constructor(configService) {
        this.apiKey = configService.get('EXCHANGE_RATE_API_KEY');
    }
    async convertToBdt(from, amount) {
        let rate = 117.50;
        try {
            if (this.apiKey && this.apiKey !== 'free_or_empty' && this.apiKey !== '') {
                const url = `https://v6.exchangerate-api.com/v6/${this.apiKey}/pair/${from}/BDT`;
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    if (data.result === 'success' && data.conversion_rate) {
                        rate = parseFloat(data.conversion_rate);
                        return {
                            rate,
                            converted_bdt: Math.round(amount * rate * 100) / 100,
                            source_currency: from,
                            amount,
                        };
                    }
                }
            }
        }
        catch (e) {
            console.warn('Failed to fetch from ExchangeRate-API v6, falling back to public endpoint:', e);
        }
        try {
            const url = `https://open.er-api.com/v6/latest/${from}`;
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                if (data.result === 'success' && data.rates && data.rates['BDT']) {
                    rate = parseFloat(data.rates['BDT']);
                }
            }
        }
        catch (e) {
            console.error('Failed to convert currency via open.er-api.com:', e);
        }
        return {
            rate,
            converted_bdt: Math.round(amount * rate * 100) / 100,
            source_currency: from,
            amount,
        };
    }
};
exports.CurrencyService = CurrencyService;
exports.CurrencyService = CurrencyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], CurrencyService);
//# sourceMappingURL=currency.service.js.map