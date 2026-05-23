import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Student } from './student.entity';

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  invoice_id: string;

  @Column({ nullable: true })
  student_id: number;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @Column()
  payer_name: string;

  @Column()
  payer_phone_country_code: string;

  @Column()
  payer_phone_number: string;

  @Column()
  payment_method: string;

  @Column({ nullable: true })
  payment_detail: string;

  @Column({ nullable: true })
  bank_name: string;

  @Column('decimal', { precision: 12, scale: 2, transformer: {
    to: (value: number) => value,
    from: (value: string) => parseFloat(value)
  }})
  total_amount_bdt: number;

  @Column('decimal', { precision: 12, scale: 2, transformer: {
    to: (value: number) => value,
    from: (value: string) => parseFloat(value)
  }})
  paid_amount_bdt: number;

  @Column('decimal', { precision: 12, scale: 2, transformer: {
    to: (value: number) => value,
    from: (value: string) => parseFloat(value)
  }})
  due_amount_bdt: number;

  @Column({ nullable: true })
  pdf_path: string;

  @CreateDateColumn()
  created_at: Date;
}
