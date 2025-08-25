import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDocumentDto {
  @ApiProperty({ description: 'Name of the document', example: 'Company Policy Manual' })
  @IsString()
  name: string;
}

export class UpdateDocumentDto {
  @ApiProperty({ description: 'Updated name of the document', example: 'Updated Company Policy Manual', required: false })
  @IsOptional()
  @IsString()
  name?: string;
}
