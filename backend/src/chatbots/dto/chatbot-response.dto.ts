import { ApiProperty } from "@nestjs/swagger";

class TriggerDto {
  @ApiProperty({ description: "Trigger ID", example: "trigger-123" })
  id: string;

  @ApiProperty({ description: "Trigger value", example: "help" })
  value: string;
}

class AllowedDomainDto {
  @ApiProperty({ description: "Domain ID", example: "domain-123" })
  id: string;

  @ApiProperty({ description: "Domain value", example: "example.com" })
  value: string;
}

class DocumentDto {
  @ApiProperty({ description: "Document ID", example: "123e4567-e89b-12d3-a456-426614174000" })
  id: string;

  @ApiProperty({ description: "Document name", example: "Company Policies.pdf" })
  name: string;

  @ApiProperty({ description: "File name", example: "company-policies.pdf" })
  fileName: string;

  @ApiProperty({ description: "MIME type", example: "application/pdf" })
  mimeType: string;

  @ApiProperty({ description: "File size in bytes", example: 1024000 })
  fileSize: number;

  @ApiProperty({ description: "Whether the document is processed", example: true })
  isProcessed: boolean;
}

export class ChatbotResponseDto {
  @ApiProperty({ description: "Unique identifier", example: "123e4567-e89b-12d3-a456-426614174000" })
  id: string;

  @ApiProperty({ description: "Name of the chatbot", example: "Customer Support Bot" })
  name: string;

  @ApiProperty({ description: "Primary color", example: "#3b82f6" })
  color: string;

  @ApiProperty({ description: "Welcome message", example: "Hello! How can I help you today?" })
  welcomeMessage: string;

  @ApiProperty({ description: "Input placeholder text", example: "Type your message here..." })
  placeholder?: string;

  @ApiProperty({ description: "Chatbot tone", example: "friendly" })
  tone?: string;

  @ApiProperty({ description: "Whether to follow up", example: false })
  shouldFollowUp: boolean;

  @ApiProperty({ 
    description: "Trigger words", 
    type: [TriggerDto],
    example: [{ id: "trigger-1", value: "help" }, { id: "trigger-2", value: "support" }]
  })
  triggers?: TriggerDto[];

  @ApiProperty({ 
    description: "Allowed domains where the chatbot can be used", 
    type: [AllowedDomainDto],
    example: [{ id: "domain-1", value: "example.com" }, { id: "domain-2", value: "mysite.org" }]
  })
  allowedDomains?: AllowedDomainDto[];

  @ApiProperty({ description: "Icon URL", example: "/api/chatbots/icons/chatbot-id.png" })
  iconUrl?: string;

  @ApiProperty({ description: "Whether the chatbot is active", example: true })
  isActive: boolean;

  @ApiProperty({ description: "Creation timestamp", example: "2024-01-01T00:00:00.000Z" })
  createdAt: Date;

  @ApiProperty({ description: "Last update timestamp", example: "2024-01-01T00:00:00.000Z" })
  updatedAt: Date;

  @ApiProperty({ description: "Owner user ID", example: "123e4567-e89b-12d3-a456-426614174000" })
  userId: string;

  @ApiProperty({ 
    description: "Associated documents", 
    type: [DocumentDto],
    required: false 
  })
  documents?: DocumentDto[];
}
