import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Chatbot } from "../../chatbots/entities/chatbot.entity";
import { ChatMessage } from "./chat-message.entity";

@Entity("chats")
export class Chat {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  sessionId: string;

  @CreateDateColumn()
  startedAt: Date;

  @Column({ nullable: true })
  endedAt: Date;

  @ManyToOne(() => Chatbot, (chatbot) => chatbot.chats, { onDelete: 'CASCADE' })
  chatbot: Chatbot;

  @Column()
  chatbotId: string;

  @OneToMany(() => ChatMessage, (message) => message.chat, { cascade: true })
  messages: ChatMessage[];
}