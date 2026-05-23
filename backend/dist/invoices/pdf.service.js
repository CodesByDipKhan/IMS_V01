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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfService = void 0;
const common_1 = require("@nestjs/common");
const puppeteer = __importStar(require("puppeteer"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let PdfService = class PdfService {
    async generateInvoicePdf(invoice, studentName, outputPath) {
        let paymentRows = '';
        if (invoice.payment_method !== 'cash') {
            if (invoice.payment_method === 'bank' && invoice.bank_name) {
                paymentRows += `
          <tr>
            <td class="label">Bank Name:</td>
            <td class="value">${invoice.bank_name}</td>
          </tr>`;
            }
            if (invoice.payment_detail) {
                const detailLabel = invoice.payment_method === 'bank'
                    ? 'Account No:'
                    : invoice.payment_method === 'card'
                        ? 'Card No:'
                        : 'Mobile No:';
                paymentRows += `
          <tr>
            <td class="label">${detailLabel}</td>
            <td class="value">${invoice.payment_detail}</td>
          </tr>`;
            }
        }
        const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice</title>
        <style>
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            margin: 40px;
            color: #333;
            background-color: #fff;
          }
          .header {
            text-align: center;
            margin-bottom: 10px;
          }
          .company-name {
            font-size: 26px;
            font-weight: bold;
            color: #1e3a8a;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 5px;
          }
          .company-subtitle {
            font-size: 11px;
            color: #666;
            margin-bottom: 15px;
          }
          .divider {
            border: 0;
            border-top: 2px solid #1e3a8a;
            margin-bottom: 30px;
          }
          .title {
            text-align: center;
            font-size: 22px;
            font-weight: bold;
            letter-spacing: 2px;
            margin-bottom: 40px;
            color: #111827;
          }
          .invoice-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 40px;
          }
          .invoice-table td {
            padding: 12px 15px;
            font-size: 14px;
            border-bottom: 1px solid #f3f4f6;
          }
          .invoice-table td.label {
            font-weight: bold;
            color: #4b5563;
            width: 35%;
          }
          .invoice-table td.value {
            color: #111827;
          }
          .footer {
            margin-top: 60px;
            text-align: center;
            font-size: 11px;
            color: #9ca3af;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">NextEd Advisors</div>
          <div class="company-subtitle">Study Abroad Consultancy &amp; Student Management Services</div>
        </div>
        <hr class="divider" />
        
        <div class="title">INVOICE</div>

        <table class="invoice-table">
          <tr>
            <td class="label">Invoice No:</td>
            <td class="value">${invoice.invoice_id}</td>
          </tr>
          <tr>
            <td class="label">Student Name:</td>
            <td class="value">${studentName}</td>
          </tr>
          <tr>
            <td class="label">Payer Name:</td>
            <td class="value">${invoice.payer_name}</td>
          </tr>
          <tr>
            <td class="label">Payer Phone:</td>
            <td class="value">${invoice.payer_phone_country_code} ${invoice.payer_phone_number}</td>
          </tr>
          <tr>
            <td class="label">Payment Method:</td>
            <td class="value">${invoice.payment_method.charAt(0).toUpperCase() + invoice.payment_method.slice(1)}</td>
          </tr>
          ${paymentRows}
          <tr>
            <td class="label">Total Amount:</td>
            <td class="value">BDT ${parseFloat(invoice.total_amount_bdt).toFixed(2)}</td>
          </tr>
          <tr>
            <td class="label">Paid Amount:</td>
            <td class="value">BDT ${parseFloat(invoice.paid_amount_bdt).toFixed(2)}</td>
          </tr>
          <tr style="font-weight: bold; font-size: 16px; background-color: #f9fafb;">
            <td class="label" style="color: #111827; border-bottom: 2px solid #1e3a8a;">Due Amount:</td>
            <td class="value" style="color: #b91c1c; border-bottom: 2px solid #1e3a8a;">BDT ${parseFloat(invoice.due_amount_bdt).toFixed(2)}</td>
          </tr>
        </table>

        <div class="footer">
          Thank you for choosing NextEd Advisors. This is a system-generated electronic receipt.
        </div>
      </body>
      </html>
    `;
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        try {
            const page = await browser.newPage();
            await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });
            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' },
            });
            fs.writeFileSync(outputPath, pdfBuffer);
        }
        finally {
            await browser.close();
        }
    }
};
exports.PdfService = PdfService;
exports.PdfService = PdfService = __decorate([
    (0, common_1.Injectable)()
], PdfService);
//# sourceMappingURL=pdf.service.js.map