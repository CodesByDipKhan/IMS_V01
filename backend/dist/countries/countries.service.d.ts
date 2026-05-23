import { Repository } from 'typeorm';
import { Country } from '../entities/country.entity';
export declare class CountriesService {
    private countriesRepository;
    constructor(countriesRepository: Repository<Country>);
    findAll(): Promise<Country[]>;
}
