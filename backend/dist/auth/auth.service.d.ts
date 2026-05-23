import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
export declare class AuthService {
    private usersRepository;
    private jwtService;
    constructor(usersRepository: Repository<User>, jwtService: JwtService);
    validateUser(username: string, pass: string): Promise<any>;
    login(username: string, pass: string): Promise<{
        access_token: string;
    }>;
}
