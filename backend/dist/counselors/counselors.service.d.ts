import { Repository } from 'typeorm';
import { Counselor } from '../entities/counselor.entity';
import { CreateCounselorDto } from './dto/create-counselor.dto';
export declare class CounselorsService {
    private counselorsRepository;
    constructor(counselorsRepository: Repository<Counselor>);
    findAll(): Promise<Counselor[]>;
    create(createCounselorDto: CreateCounselorDto): Promise<Counselor>;
    remove(id: number): Promise<void>;
}
