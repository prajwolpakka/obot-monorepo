import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Token } from "../../tokens/entities/token.entity";
import { Chatbot } from "../../chatbots/entities/chatbot.entity";
import { Document } from "../../documents/entities/document.entity";
import { Subscription } from "../../subscription/entities/subscription.entity";
import { Notification } from "../../notifications/notification.entity";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  fullName: string;

  @Column()
  password: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: "timestamp", nullable: true })
  lastLogin: Date;

  @Column({ nullable: true })
  stripeCustomerId: string;

  @OneToMany(() => Token, (token) => token.user)
  tokens: Token[];

  @OneToMany(() => Chatbot, (chatbot) => chatbot.user)
  chatbots: Chatbot[];

  @OneToMany(() => Document, (document) => document.user)
  documents: Document[];

  @OneToOne(() => Subscription, (subscription) => subscription.user)
  subscription: Subscription;

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];
}
