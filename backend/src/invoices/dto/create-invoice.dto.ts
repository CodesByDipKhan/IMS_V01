import { IsNotEmpty, IsString, IsNumber, Min, Matches, IsOptional } from 'class-validator';

export class CreateInvoiceDto {
  @IsNotEmpty()
  @IsNumber()
  student_id: number;

  @IsNotEmpty()
  @IsString()
  payer_name: string;

  @IsNotEmpty()
  @IsString()
  payer_phone_country_code: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^[0-9]+$/, { message: 'Payer phone number must contain only numbers.' })
  payer_phone_number: string;

  @IsNotEmpty()
  @IsString()
  payment_method: string; // 'cash' | 'bank' | 'card' | 'mobile'

  @IsOptional()
  @IsString()
  payment_detail?: string; // ACC NO / Card NO / Phone NO depending on method

  @IsOptional()
  @IsString()
  bank_name?: string; // Only for bank payment method

  @IsNotEmpty()
  @IsNumber()
  @Min(0, { message: 'Paid amount must be positive.' })
  paid_amount_bdt: number;
}
