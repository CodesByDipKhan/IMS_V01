import { IsNotEmpty, IsString, IsEmail, Matches } from 'class-validator';

export class UpdateStudentDto {
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
}
