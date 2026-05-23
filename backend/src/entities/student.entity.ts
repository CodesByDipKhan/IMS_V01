import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Country } from './country.entity';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  student_id: string;

  @Column()
  name: string;

  @Column()
  phone_country_code: string;

  @Column()
  phone_number: string;

  @Column()
  email: string;

  @Column()
  counselor_name: string;

  @Column()
  source_type: string;

  @Column()
  source_name: string;

  @Column({ type: 'date' })
  date_of_opening: Date;

  @Column('decimal', { precision: 12, scale: 2, transformer: {
    to: (value: number) => value,
    from: (value: string) => parseFloat(value)
  }})
  file_opening_fee_bdt: number;

  @Column({ nullable: true })
  country_id: number;

  @ManyToOne(() => Country)
  @JoinColumn({ name: 'country_id' })
  country: Country;

  @Column('decimal', { precision: 10, scale: 2, transformer: {
    to: (value: number) => value,
    from: (value: string) => parseFloat(value)
  }})
  application_fee_foreign: number;

  @Column('decimal', { precision: 12, scale: 2, transformer: {
    to: (value: number) => value,
    from: (value: string) => parseFloat(value)
  }})
  application_fee_bdt: number;

  @Column('decimal', { precision: 10, scale: 4, transformer: {
    to: (value: number) => value,
    from: (value: string) => parseFloat(value)
  }})
  exchange_rate_used: number;

  @CreateDateColumn()
  created_at: Date;
}
