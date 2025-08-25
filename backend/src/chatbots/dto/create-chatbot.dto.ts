import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsEnum, IsOptional, IsString, IsArray } from "class-validator";

export class CreateChatbotDto {
  @ApiProperty({ description: "Name of the chatbot", example: "Customer Support Bot" })
  @IsString()
  @Transform(({ value }) => value?.toString())
  name: string;

  @ApiProperty({ description: "Primary color", example: "#3b82f6" })
  @IsString()
  @Transform(({ value }) => value?.toString())
  color: string;

  @ApiProperty({ description: "Welcome message", example: "Hello! How can I help you today?" })
  @IsString()
  @Transform(({ value }) => value?.toString())
  welcomeMessage: string;

  @ApiProperty({ description: "Input placeholder text", example: "Type your message here...", required: false })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toString())
  placeholder?: string;

  @ApiProperty({ description: "Chatbot tone", enum: ["professional", "friendly", "casual"], required: false })
  @IsOptional()
  @IsEnum(["professional", "friendly", "casual"])
  @Transform(({ value }) => value?.toString())
  tone?: "professional" | "friendly" | "casual";

  @ApiProperty({ description: "Whether to follow up", example: false, required: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === "string") {
      return value === "true";
    }
    return Boolean(value);
  })
  shouldFollowUp?: boolean;

  @ApiProperty({
    description: "Trigger words",
    example: [{ id: "2025-07-08T06:32:56.758Z", value: "What is the interest rate ?" }],
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return Array.isArray(value) ? value : [];
  })
  triggers?: { id: string; value: string }[];

  @ApiProperty({
    description: "Allowed domains where the chatbot can be used",
    example: [{ id: "2025-07-08T06:32:56.758Z", value: "example.com" }],
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return Array.isArray(value) ? value : [];
  })
  allowedDomains?: { id: string; value: string }[];

  @ApiProperty({ description: "Whether the chatbot is active", example: true, required: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === "string") {
      return value === "true";
    }
    return Boolean(value);
  })
  isActive?: boolean;

  @ApiProperty({ description: "Chatbot icon file", type: "string", format: "binary", required: false })
  icon?: any;

  @ApiProperty({ 
    description: "Array of existing document IDs to associate with the chatbot", 
    type: [String], 
    example: ["doc-id-1", "doc-id-2"],
    required: false 
  })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return Array.isArray(value) ? value : [];
  })
  selectedDocuments?: string[];

  @ApiProperty({ 
    description: "Files to upload and associate with the chatbot", 
    type: "array",
    items: { type: "string", format: "binary" },
    required: false 
  })
  files?: any[];
}
