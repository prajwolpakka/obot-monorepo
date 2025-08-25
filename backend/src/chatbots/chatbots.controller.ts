import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, UseInterceptors, UploadedFile, UploadedFiles, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChatbotsService } from './chatbots.service';
import { CreateChatbotDto } from './dto/create-chatbot.dto';
import { UpdateChatbotDto } from './dto/update-chatbot.dto';
import { ChatbotResponseDto } from './dto/chatbot-response.dto';
import { MessageResponseDto, ErrorResponseDto } from '../common/dto/response.dto';

@ApiTags('chatbots')
@ApiBearerAuth()
@Controller('chatbots')
@UseGuards(JwtAuthGuard)
export class ChatbotsController {
  constructor(private readonly chatbotsService: ChatbotsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new chatbot with optional file uploads' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Chatbot created successfully', type: ChatbotResponseDto })
  @ApiResponse({ status: 400, description: 'Bad Request', type: ErrorResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponseDto })
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'icon', maxCount: 1 },
    { name: 'files' }  // No maxCount = unlimited files
  ], {
    storage: diskStorage({
      destination: (req, file, cb) => {
        // Different destinations based on field name
        const dest = file.fieldname === 'icon' ? './uploads/icons' : './uploads/documents';
        cb(null, dest);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (file.fieldname === 'icon') {
        // Icon validation
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          cb(null, true);
        } else {
          cb(new Error('Icon must be an image file'), false);
        }
      } else {
        // Document validation - allow common document types
        const allowedMimes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'image/jpeg',
          'image/png',
          'image/gif'
        ];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Invalid document type'), false);
        }
      }
    },
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  }))
  create(
    @Body() createChatbotDto: CreateChatbotDto, 
    @UploadedFiles() files: { icon?: Express.Multer.File[], files?: Express.Multer.File[] },
    @Request() req
  ) {
    const iconFile = files.icon ? files.icon[0] : undefined;
    const uploadedFiles = files.files || [];
    return this.chatbotsService.create(createChatbotDto, req.user.id, iconFile, uploadedFiles);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user chatbots' })
  @ApiResponse({ status: 200, description: 'List of chatbots retrieved successfully', type: [ChatbotResponseDto] })
  findAll(@Request() req) {
    return this.chatbotsService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get chatbot by ID' })
  @ApiResponse({ status: 200, description: 'Chatbot retrieved successfully', type: ChatbotResponseDto })
  @ApiResponse({ status: 404, description: 'Chatbot not found', type: ErrorResponseDto })
  findOne(@Param('id') id: string, @Request() req) {
    return this.chatbotsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update chatbot' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Chatbot updated successfully', type: ChatbotResponseDto })
  @ApiResponse({ status: 404, description: 'Chatbot not found', type: ErrorResponseDto })
  @UseInterceptors(FileInterceptor('icon', {
    storage: diskStorage({
      destination: './uploads/icons',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
        cb(null, true);
      } else {
        cb(new Error('Icon must be an image file'), false);
      }
    },
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  }))
  update(
    @Param('id') id: string, 
    @Body() updateChatbotDto: UpdateChatbotDto, 
    @UploadedFile() iconFile: Express.Multer.File,
    @Request() req
  ) {
    return this.chatbotsService.update(id, updateChatbotDto, req.user.id, iconFile);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete chatbot' })
  @ApiResponse({ status: 200, description: 'Chatbot deleted successfully' })
  @ApiResponse({ status: 404, description: 'Chatbot not found', type: ErrorResponseDto })
  remove(@Param('id') id: string, @Request() req) {
    return this.chatbotsService.remove(id, req.user.id);
  }

  @Get('icons/:filename')
  @ApiOperation({ summary: 'Get chatbot icon' })
  getIcon(@Param('filename') filename: string, @Res() res: Response) {
    return res.sendFile(join(process.cwd(), 'uploads', 'icons', filename));
  }

  @Post(':id/documents')
  @ApiOperation({ summary: 'Add documents to chatbot' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Documents added successfully' })
  @UseInterceptors(FilesInterceptor('files', 10, {
    storage: diskStorage({
      destination: './uploads/documents',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      const allowedMimes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ];
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid document type'), false);
      }
    },
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  }))
  addDocuments(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req
  ) {
    return this.chatbotsService.addDocuments(id, files, req.user.id);
  }

  @Post(':id/documents/link')
  @ApiOperation({ summary: 'Link existing documents to chatbot' })
  @ApiResponse({ status: 201, description: 'Documents linked successfully' })
  linkDocuments(
    @Param('id') id: string,
    @Body() body: { documentIds: string[] },
    @Request() req
  ) {
    return this.chatbotsService.linkDocuments(id, body.documentIds, req.user.id);
  }

  @Delete(':id/documents/:documentId')
  @ApiOperation({ summary: 'Remove document from chatbot' })
  @ApiResponse({ status: 200, description: 'Document removed successfully' })
  removeDocument(
    @Param('id') id: string,
    @Param('documentId') documentId: string,
    @Request() req
  ) {
    return this.chatbotsService.removeDocument(id, documentId, req.user.id);
  }

  @Get(':id/debug/documents')
  @ApiOperation({ summary: 'Debug: Get detailed document information for chatbot' })
  @ApiResponse({ status: 200, description: 'Debug information retrieved successfully' })
  debugChatbotDocuments(
    @Param('id') id: string,
    @Request() req
  ) {
    return this.chatbotsService.debugChatbotDocuments(id, req.user.id);
  }
}
