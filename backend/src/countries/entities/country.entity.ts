import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("countries")
export class Country {
  @ApiProperty({ example: "US" })
  @PrimaryColumn({ type: "varchar", length: 2 })
  isoCode: string;

  @ApiProperty({ example: "United States" })
  @Column({ type: "varchar", length: 100 })
  name: string;

  @ApiProperty({ example: "+1" })
  @Column({ type: "varchar", length: 25 })
  phoneCode: string;

  @ApiProperty({ example: "USD" })
  @Column({ type: "varchar", length: 3 })
  currency: string;
}
