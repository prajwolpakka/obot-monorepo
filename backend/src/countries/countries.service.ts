import { Injectable } from "@nestjs/common";
import { countries } from "./seed/countries.seed";
import { ApiResponse } from "@nestjs/swagger";

interface Country {
  isoCode: string;
  name: string;
  phoneCode: string;
  currency: string;
}

@Injectable()
export class CountriesService {
  async findAll() {
    return countries;
  }

  async getCountries(): Promise<Country[]> {
    return countries;
  }
}
