import { IsNotEmpty, IsString, IsEmail, Matches, IsNumber, Min } from 'class-validator';

export class CreateStudentDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-zA-Z\s]+$/, { message: 'Name must contain only alphabets and spaces.' })
  name: string;

  @IsNotEmpty()
  @IsString()
  phone_country_code: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^[0-9]+$/, { message: 'Phone number must contain only numbers.' })
  phone_number: string;

  @IsNotEmpty()
  @IsEmail({}, { message: 'Email must be a valid email address.' })
  email: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-zA-Z\s]+$/, { message: 'Counselor name must contain only alphabets and spaces.' })
  counselor_name: string;

  @IsNotEmpty()
  @IsString()
  source_type: string; // 'employee' or 'social_media'

  @IsNotEmpty()
  @IsString()
  source_name: string; // Employee name or social media platform

  @IsNotEmpty()
  @IsString()
  date_of_opening: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0, { message: 'File opening fee must be positive.' })
  file_opening_fee_bdt: number;

  @IsNotEmpty()
  @IsNumber()
  country_id: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0, { message: 'Application fee in foreign currency must be positive.' })
  application_fee_foreign: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0, { message: 'Application fee in BDT must be positive.' })
  application_fee_bdt: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0, { message: 'Exchange rate used must be positive.' })
  exchange_rate_used: number;
}
