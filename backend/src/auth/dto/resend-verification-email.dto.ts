import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ResendVerificationEmailDto {
  @ApiProperty({ 
    description: 'Email address to resend verification email to', 
    example: 'user@example.com' 
  })
  @IsEmail()
  email: string;
}
