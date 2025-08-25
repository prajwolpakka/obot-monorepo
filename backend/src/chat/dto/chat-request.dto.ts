import { IsString, IsArray, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChatRequestDto {
  @ApiProperty({ description: 'User question' })
  @IsString()
  question: string;

  @ApiProperty({ description: 'List of document IDs for context', type: [String] })
  @IsArray()
  @IsString({ each: true })
  documents: string[];

  @ApiProperty({ description: 'Whether to stream response', default: false })
  @IsBoolean()
  @IsOptional()
  stream?: boolean = false;

  @ApiProperty({ description: 'Chatbot ID', required: false })
  @IsString()
  @IsOptional()
  chatbotId?: string;
}
