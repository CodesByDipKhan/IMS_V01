import { CounselorsService } from './counselors.service';
import { CreateCounselorDto } from './dto/create-counselor.dto';
import { Counselor } from '../entities/counselor.entity';
export declare class CounselorsController {
    private readonly counselorsService;
    constructor(counselorsService: CounselorsService);
    findAll(): Promise<Counselor[]>;
    create(createCounselorDto: CreateCounselorDto): Promise<Counselor>;
    remove(id: number): Promise<void>;
}
