import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Chatbot Platform API')
  .setDescription(`
# Chatbot Platform API

A comprehensive API for an AI-powered chatbot platform that enables users to:

- Create and manage intelligent chatbots
- Engage in conversations with AI assistants  
- Upload and manage documents for knowledge base
- Handle user subscriptions and billing
- Access analytics and dashboard insights

## Features

### 🤖 Chatbot Management
- Create custom AI chatbots with specific instructions
- Configure different AI models and behaviors
- Manage chatbot settings and permissions

### 💬 Chat System  
- Start chat sessions with any chatbot
- Send messages and receive AI responses
- View chat history and manage conversations

### 📄 Document Management
- Upload documents (PDF, DOC, TXT, images, etc.)
- Organize and categorize files
- Process documents for chatbot knowledge

### 💳 Subscription Management
- Manage user subscription plans (Free, Basic, Premium)
- Handle billing and payment processing
- Track usage and plan limits

### 📊 Analytics Dashboard
- View platform usage statistics
- Monitor chatbot performance
- Track user engagement metrics

## Authentication

This API uses JWT (JSON Web Token) for authentication. Include the bearer token in the Authorization header:

\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`

## Getting Started

1. **Sign up** for an account using the auth endpoints
2. **Verify your email** address
3. **Create your first chatbot** 
4. **Upload documents** to build knowledge base
5. **Start chatting** with your AI assistant
  `)
  .setVersion('1.0.0')
  .setContact('API Support', 'https://yourplatform.com/support', 'support@yourplatform.com')
  .setLicense('MIT', 'https://opensource.org/licenses/MIT')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Enter JWT token',
      in: 'header',
    },
    'JWT-auth'
  )
  .addTag('auth', 'Authentication and authorization endpoints')
  .addTag('users', 'User account management')
  .addTag('chatbots', 'AI chatbot creation and management')
  .addTag('chat', 'Chat sessions and messaging')
  .addTag('documents', 'Document upload and management')
  .addTag('subscription', 'User subscription and billing')
  .addTag('dashboard', 'Analytics and dashboard data')
  .addServer('http://localhost:8001', 'Development server')
  .addServer('https://api.yourplatform.com', 'Production server')
  .build();
