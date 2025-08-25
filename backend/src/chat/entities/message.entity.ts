import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Chat } from './chat.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  content: string;

  @Column({ enum: ['user', 'assistant'] })
  role: 'user' | 'assistant';

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Chat, chat => chat.messages)
  chat: Chat;

  @Column()
  chatId: string;
}
