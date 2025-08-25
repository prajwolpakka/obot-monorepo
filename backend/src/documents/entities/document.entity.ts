import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ChatbotDocument } from '../../chatbots/entities/chatbot-document.entity';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  fileName: string;

  @Column()
  filePath: string;

  @Column()
  mimeType: string;

  @Column({ type: 'bigint' })
  fileSize: number;

  @Column({ default: 'pending' })
  status: 'pending' | 'embedding' | 'processed' | 'failed';

  @Column({ default: false })
  isProcessed: boolean;

  @Column('text', { nullable: true })
  extractedText: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, user => user.documents)
  user: User;

  @Column()
  userId: string;

  @OneToMany(() => ChatbotDocument, (chatbotDocument) => chatbotDocument.document)
  chatbots: ChatbotDocument[];
}
