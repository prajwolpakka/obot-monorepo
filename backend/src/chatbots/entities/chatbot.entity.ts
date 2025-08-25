import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Exclude } from "class-transformer";
import { Chat } from "../../chat/entities/chat.entity";
import { User } from "../../users/entities/user.entity";
import { ChatbotDocument } from "./chatbot-document.entity";

@Entity("chatbots")
export class Chatbot {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column()
  color: string;

  @Column()
  welcomeMessage: string;

  @Column({ nullable: true })
  placeholder: string;

  @Column({ nullable: true })
  tone: "professional" | "friendly" | "casual";

  @Column({ default: false })
  shouldFollowUp: boolean;

  @Column("json", { nullable: true })
  triggers: { id: string; value: string }[];

  @Column("json", { nullable: true })
  allowedDomains: { id: string; value: string }[];

  @Column({ nullable: true })
  iconUrl: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.chatbots)
  @Exclude()
  user: User;

  @Column()
  userId: string;

  @OneToMany(() => Chat, (chat) => chat.chatbot, { cascade: true })
  @Exclude()
  chats: Chat[];

  @OneToMany(() => ChatbotDocument, (chatbotDocument) => chatbotDocument.chatbot)
  documents: ChatbotDocument[];
}
