import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  Request,
  UseInterceptors,
  UploadedFile,
  Res,
  StreamableFile,
  Logger,
  Query
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto, UpdateDocumentDto } from './dto/document.dto';
import { Express, Response } from 'express';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('documents')
@ApiBearerAuth()
@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  private readonly logger = new Logger(DocumentsController.name);

  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a document' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Document uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file or data' })
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Body() createDocumentDto: CreateDocumentDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req
  ) {
    this.logger.log(`📤 Upload request from user ${req.user.id} - File: ${file?.filename || 'No file'}`);
    
    try {
      const result = await this.documentsService.create(createDocumentDto, file, req.user.id);
      this.logger.log(`✅ Upload successful - Document ID: ${result.id}`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Upload failed for user ${req.user.id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all user documents' })
  @ApiResponse({ status: 200, description: 'Documents retrieved successfully' })
  async findAll(@Request() req) {
    this.logger.log(`📋 Retrieving documents for user ${req.user.id}`);
    
    try {
      const documents = await this.documentsService.findAll(req.user.id);
      this.logger.log(`✅ Retrieved ${documents.length} documents for user ${req.user.id}`);
      return documents;
    } catch (error) {
      this.logger.error(`❌ Failed to retrieve documents for user ${req.user.id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get('paginated')
  @ApiOperation({ summary: 'Get paginated user documents' })
  @ApiResponse({ status: 200, description: 'Documents retrieved successfully' })
  async findAllPaginated(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC'
  ) {
    const paginationDto: PaginationDto = {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      sortBy: sortBy || 'createdAt',
      sortOrder: sortOrder || 'DESC'
    };
    
    return this.documentsService.findAllPaginated(req.user.id, paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document by ID' })
  @ApiResponse({ status: 200, description: 'Document retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async findOne(@Param('id') id: string, @Request() req) {
    this.logger.log(`🔍 Retrieving document ${id} for user ${req.user.id}`);
    
    try {
      const document = await this.documentsService.findOne(id, req.user.id);
      this.logger.log(`✅ Document ${id} retrieved successfully`);
      return document;
    } catch (error) {
      this.logger.error(`❌ Failed to retrieve document ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update document metadata' })
  @ApiResponse({ status: 200, description: 'Document updated successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async update(@Param('id') id: string, @Body() updateDocumentDto: UpdateDocumentDto, @Request() req) {
    this.logger.log(`📝 Updating document ${id} for user ${req.user.id}`);
    
    try {
      const result = await this.documentsService.update(id, updateDocumentDto, req.user.id);
      this.logger.log(`✅ Document ${id} updated successfully`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to update document ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete document' })
  @ApiResponse({ status: 200, description: 'Document deleted successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async remove(@Param('id') id: string, @Request() req) {
    this.logger.log(`🗑️ Deleting document ${id} for user ${req.user.id}`);
    
    try {
      await this.documentsService.remove(id, req.user.id);
      this.logger.log(`✅ Document ${id} deleted successfully`);
      return { message: 'Document deleted successfully' };
    } catch (error) {
      this.logger.error(`❌ Failed to delete document ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get(':id/file')
  @ApiOperation({ summary: 'Download/view document file' })
  @ApiResponse({ status: 200, description: 'File retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Document or file not found' })
  async getFile(@Param('id') id: string, @Request() req, @Res({ passthrough: true }) res: Response) {
    this.logger.log(`📥 File download request for document ${id} from user ${req.user.id}`);
    
    try {
      const document = await this.documentsService.findOne(id, req.user.id);
      
      const filePath = join(process.cwd(), document.filePath);
      this.logger.debug(`📂 File path: ${filePath}`);
      
      if (!existsSync(filePath)) {
        this.logger.error(`❌ File not found on disk: ${filePath}`);
        throw new Error('File not found on disk');
      }

      const file = createReadStream(filePath);
      
      res.set({
        'Content-Type': document.mimeType,
        'Content-Disposition': `inline; filename="${document.name}"`,
      });

      this.logger.log(`✅ File download initiated for ${document.fileName}`);
      return new StreamableFile(file);
    } catch (error) {
      this.logger.error(`❌ File download failed for document ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Force download document file' })
  @ApiResponse({ status: 200, description: 'File downloaded successfully' })
  @ApiResponse({ status: 404, description: 'Document or file not found' })
  async downloadFile(@Param('id') id: string, @Request() req, @Res({ passthrough: true }) res: Response) {
    this.logger.log(`💾 File download request for document ${id} from user ${req.user.id}`);
    
    try {
      const document = await this.documentsService.findOne(id, req.user.id);
      
      const filePath = join(process.cwd(), document.filePath);
      
      if (!existsSync(filePath)) {
        throw new Error('File not found on disk');
      }

      const file = createReadStream(filePath);
      
      res.set({
        'Content-Type': document.mimeType,
        'Content-Disposition': `attachment; filename="${document.name}"`,
      });

      return new StreamableFile(file);
    } catch (error) {
      this.logger.error(`❌ File download failed for document ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get(':id/embedding-status')
  @ApiOperation({ summary: 'Get document embedding status' })
  @ApiResponse({ status: 200, description: 'Embedding status retrieved' })
  async getEmbeddingStatus(@Param('id') id: string, @Request() req) {
    const document = await this.documentsService.findOne(id, req.user.id);
    return { 
      documentId: id,
      status: document.status,
      isProcessed: document.isProcessed 
    };
  }

  @Post(':id/reprocess')
  @ApiOperation({ summary: 'Reprocess document for embedding' })
  @ApiResponse({ status: 200, description: 'Document reprocessing started' })
  async reprocess(@Param('id') id: string, @Request() req) {
    this.logger.log(`🔄 Reprocessing document ${id} for user ${req.user.id}`);
    
    try {
      await this.documentsService.reprocessDocument(id, req.user.id);
      this.logger.log(`✅ Document ${id} reprocessing started`);
      return { message: 'Document reprocessing started' };
    } catch (error) {
      this.logger.error(`❌ Failed to reprocess document ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }
}
