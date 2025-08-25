import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { Country } from "./entities/country.entity";
import { CountriesService } from "./countries.service";

@ApiTags("countries")
@Controller("countries")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  @Get()
  @ApiOperation({ summary: "Get all countries" })
  @ApiResponse({
    status: 200,
    description: "Returns all countries",
    type: [Country],
  })
  async findAll(): Promise<Country[]> {
    return this.countriesService.findAll();
  }
}
