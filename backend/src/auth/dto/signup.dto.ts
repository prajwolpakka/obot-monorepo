import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from "class-validator";

export class SignupDto {
  @ApiProperty({ example: "john.doe@example.com" })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: "John" })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: "Password123!" })
  @IsString()
  @MinLength(8)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      "Password is too weak. It should contain at least 1 uppercase letter, 1 lowercase letter, and 1 number or special character.",
  })
  @IsNotEmpty()
  password: string;
}
