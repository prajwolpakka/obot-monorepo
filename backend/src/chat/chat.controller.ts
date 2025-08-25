import { Controller, Get, Param, UseGuards, Request, Query, Delete, Post, Body, Logger, Response } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChatService } from './chat.service';
import { ChatRequestDto } from './dto/chat-request.dto';

@ApiTags('chat')
@ApiBearerAuth()
@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(private readonly chatService: ChatService) {}

  @Get('conversations')
  @ApiOperation({ summary: 'Get conversations for the authenticated user with pagination' })
  @ApiResponse({ status: 200, description: 'Conversations retrieved successfully' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of conversations to return (default: 10)' })
  @ApiQuery({ name: 'offset', required: false, description: 'Number of conversations to skip (default: 0)' })
  async getConversations(
    @Request() req,
    @Query('limit') limit: string = '10',
    @Query('offset') offset: string = '0'
  ) {
    return this.chatService.getConversationsForUser(req.user.id, parseInt(limit), parseInt(offset));
  }

  @Get('chatbot/:chatbotId/conversations')
  @ApiOperation({ summary: 'Get all conversations for a specific chatbot' })
  @ApiResponse({ status: 200, description: 'Conversations retrieved successfully' })
  async getChatbotConversations(@Param('chatbotId') chatbotId: string, @Request() req) {
    return this.chatService.getAllChatsForChatbot(chatbotId);
  }

  @Get(':chatId/messages')
  @ApiOperation({ summary: 'Get messages from a chat session' })
  @ApiResponse({ status: 200, description: 'Messages retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Chat not found' })
  async getChatMessages(@Param('chatId') chatId: string, @Request() req) {
    return this.chatService.getChatMessagesForChat(chatId);
  }

  @Delete(':chatId')
  @ApiOperation({ summary: 'Delete a conversation' })
  @ApiResponse({ status: 200, description: 'Conversation deleted successfully' })
  @ApiResponse({ status: 404, description: 'Conversation not found or access denied' })
  async deleteConversation(@Param('chatId') chatId: string, @Request() req) {
    await this.chatService.deleteConversation(chatId, req.user.id);
    return { message: 'Conversation deleted successfully' };
  }

  @Post('ask')
  @ApiOperation({ summary: 'Ask a question to AI with document context' })
  @ApiResponse({ status: 200, description: 'AI response retrieved successfully' })
  async askQuestion(@Body() chatRequest: ChatRequestDto, @Request() req, @Response() res) {
    this.logger.log(`💬 Chat request from user ${req.user.id} - Question: "${chatRequest.question.substring(0, 50)}..."`);
    this.logger.debug(`📊 Request details: ${chatRequest.documents.length} documents, stream: ${chatRequest.stream}`);
    
    try {
      if (chatRequest.stream) {
        // Handle streaming response
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        });
        
        await this.chatService.chatWithBrainStream(chatRequest, (chunk: string) => {
          res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
        });
        
        res.write('data: [DONE]\n\n');
        res.end();
      } else {
        // Handle non-streaming response
        const answer = await this.chatService.chatWithBrain(chatRequest);
        this.logger.log(`✅ Chat response generated successfully for user ${req.user.id}`);
        return { message: 'Response generated successfully', data: { answer } };
      }
    } catch (error) {
      this.logger.error(`❌ Chat request failed for user ${req.user.id}: ${error.message}`, error.stack);
      throw error;
    }
  }
}