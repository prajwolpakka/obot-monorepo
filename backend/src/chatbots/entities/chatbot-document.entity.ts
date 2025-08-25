import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, Column } from 'typeorm';
import { Chatbot } from './chatbot.entity';
import { Document } from '../../documents/entities/document.entity';

@Entity('chatbot_documents')
export class ChatbotDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Chatbot, chatbot => chatbot.documents, { onDelete: 'CASCADE' })
  chatbot: Chatbot;

  @Column()
  chatbotId: string;

  @ManyToOne(() => Document, document => document.chatbots, { onDelete: 'CASCADE' })
  document: Document;

  @Column()
  documentId: string;

  @CreateDateColumn()
  createdAt: Date;
}
