import { CountriesService } from './countries.service';
import { Country } from '../entities/country.entity';
export declare class CountriesController {
    private readonly countriesService;
    constructor(countriesService: CountriesService);
    findAll(): Promise<Country[]>;
}
