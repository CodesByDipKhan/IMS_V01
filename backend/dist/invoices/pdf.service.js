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
    async generateInvoicePdf(invoice, studentName, phoneCountryCode, phoneNumber, fileOpeningFeeBdt, outputPath) {
        const createdAt = invoice.created_at ? new Date(invoice.created_at) : new Date();
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const dateStr = `${createdAt.getDate()} ${months[createdAt.getMonth()]}, ${createdAt.getFullYear()}`;
        let hours = createdAt.getHours();
        const minutes = createdAt.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const minutesStr = minutes < 10 ? '0' + minutes : minutes;
        const timeStr = `${hours}:${minutesStr} ${ampm}`;
        let paymentDetailSection = '';
        if (invoice.payment_method !== 'cash') {
            const label = invoice.payment_method === 'bank'
                ? 'Account No:'
                : invoice.payment_method === 'card'
                    ? 'Card No:'
                    : 'Mobile No:';
            const bankRow = invoice.payment_method === 'bank' && invoice.bank_name
                ? `<div class="detail-subitem"><span class="sub-label">Bank:</span><span class="sub-val">${invoice.bank_name}</span></div>`
                : '';
            paymentDetailSection = `
        <div class="payment-details-box">
          <div class="detail-title">Transaction Info</div>
          ${bankRow}
          <div class="detail-subitem">
            <span class="sub-label">${label}</span>
            <span class="sub-val">${invoice.payment_detail || 'N/A'}</span>
          </div>
        </div>
      `;
        }
        const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
        <style>
          body {
            font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 40px;
            color: #1e293b;
            background-color: #fff;
            -webkit-print-color-adjust: exact;
          }
          .brand-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #f1f5f9;
            padding-bottom: 20px;
          }
          .brand-logo {
            font-size: 26px;
            font-weight: 800;
            color: #1e40af;
            letter-spacing: -0.5px;
          }
          .brand-sub {
            font-size: 11px;
            font-weight: 600;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          /* Elegant 3-column Grid Header */
          .grid-header {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 20px;
            margin-bottom: 40px;
            padding: 20px 24px;
            background-color: #f8fafc;
            border-radius: 16px;
            border: 1px solid #e2e8f0;
          }
          .grid-col {
            display: flex;
            flex-direction: column;
          }
          .grid-col .label {
            font-size: 10px;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 6px;
          }
          .grid-col .value {
            font-size: 14px;
            font-weight: 700;
            color: #0f172a;
          }
          .grid-col .value-sub {
            font-size: 12px;
            font-weight: 500;
            color: #475569;
            margin-top: 2px;
          }

          /* Main Table Styling */
          .elegant-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            margin-top: 10px;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            overflow: hidden;
          }
          .elegant-table th {
            background-color: #1e40af;
            color: #ffffff;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            padding: 14px 20px;
            text-align: left;
            border: none;
          }
          .elegant-table td {
            padding: 16px 20px;
            font-size: 13px;
            font-weight: 500;
            color: #334155;
            border-bottom: 1px solid #f1f5f9;
            background-color: #ffffff;
          }
          .elegant-table tr:last-child td {
            border-bottom: none;
          }
          .elegant-table td.label-col {
            font-weight: 600;
            color: #475569;
            width: 40%;
          }
          .elegant-table td.value-col {
            color: #0f172a;
            font-weight: 700;
          }
          
          /* Financial totals highlighting */
          .elegant-table tr.total-row td {
            background-color: #f8fafc;
            border-top: 2px solid #e2e8f0;
          }
          .elegant-table tr.due-row td {
            background-color: #fef2f2;
            border-top: 1px solid #fecaca;
          }
          .elegant-table tr.due-row td.value-col {
            color: #dc2626;
            font-size: 15px;
          }

          .payment-details-box {
            margin-top: 20px;
            padding: 16px 20px;
            background-color: #fafafa;
            border: 1px dashed #cbd5e1;
            border-radius: 10px;
            max-width: 250px;
          }
          .payment-details-box .detail-title {
            font-size: 10px;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
          }
          .payment-details-box .detail-subitem {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            margin-bottom: 4px;
          }
          .payment-details-box .detail-subitem:last-child {
            margin-bottom: 0;
          }
          .payment-details-box .sub-label {
            color: #475569;
            font-weight: 600;
          }
          .payment-details-box .sub-val {
            color: #0f172a;
            font-weight: 700;
          }

          .footer {
            margin-top: 60px;
            text-align: center;
            font-size: 10px;
            font-weight: 600;
            color: #94a3b8;
            letter-spacing: 0.5px;
          }
        </style>
      </head>
      <body>
        <div class="brand-container">
          <div>
            <div class="brand-logo">NextEd Advisors</div>
            <div class="brand-sub">Study Abroad Consultancy</div>
          </div>
          <div style="text-align: right; font-size: 12px; font-weight: 700; color: #475569;">
            OFFICIAL RECEIPT
          </div>
        </div>

        <!-- 3-Column Top Header Grid -->
        <div class="grid-header">
          <div class="grid-col">
            <span class="label">Invoice to</span>
            <span class="value" style="color: #1e40af;">${invoice.invoice_id}</span>
            <span class="value-sub">Payer: ${invoice.payer_name}</span>
            <span class="value-sub">Phone: ${invoice.payer_phone_country_code} ${invoice.payer_phone_number}</span>
          </div>
          
          <div class="grid-col" style="border-left: 1px solid #e2e8f0; padding-left: 20px; border-right: 1px solid #e2e8f0; padding-right: 20px;">
            <span class="label">Payment Method</span>
            <span class="value" style="text-transform: uppercase;">${invoice.payment_method}</span>
            ${invoice.bank_name ? `<span class="value-sub">Bank: ${invoice.bank_name}</span>` : ''}
            ${invoice.payment_detail ? `<span class="value-sub">Ref: ${invoice.payment_detail}</span>` : ''}
          </div>
          
          <div class="grid-col" style="padding-left: 20px; text-align: right; align-items: flex-end;">
            <span class="label">Date &amp; Time</span>
            <span class="value">${dateStr}</span>
            <span class="value-sub">${timeStr}</span>
          </div>
        </div>

        <!-- Elegant Billing Table -->
        <table class="elegant-table">
          <thead>
            <tr>
              <th colspan="2">Billing Summary Details</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="label-col">Student's Name</td>
              <td class="value-col">${studentName}</td>
            </tr>
            <tr>
              <td class="label-col">Phone No</td>
              <td class="value-col">${phoneCountryCode} ${phoneNumber}</td>
            </tr>
            <tr>
              <td class="label-col">File Opening Fee</td>
              <td class="value-col">BDT ${parseFloat(String(fileOpeningFeeBdt)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
            ${invoice.application_fee_bdt > 0 ? `
            <tr>
              <td class="label-col">Application Fee</td>
              <td class="value-col">BDT ${parseFloat(String(invoice.application_fee_bdt)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
            ` : ''}
            <tr class="total-row">
              <td class="label-col" style="color: #0f172a;">Total Amount</td>
              <td class="value-col" style="color: #1e40af;">BDT ${parseFloat(String(invoice.total_amount_bdt)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
            <tr class="total-row">
              <td class="label-col" style="color: #0f172a;">Paid Amount</td>
              <td class="value-col" style="color: #16a34a;">BDT ${parseFloat(String(invoice.paid_amount_bdt)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
            <tr class="due-row">
              <td class="label-col" style="font-weight: 700;">Due Amount</td>
              <td class="value-col">BDT ${parseFloat(String(invoice.due_amount_bdt)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
          </tbody>
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
                margin: { top: '30px', bottom: '30px', left: '30px', right: '30px' },
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