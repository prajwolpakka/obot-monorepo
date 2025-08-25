import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index, ManyToOne } from "typeorm";
import { User } from "../../users/entities/user.entity";

export enum TokenType {
  EMAIL_VERIFICATION = "email_verification",
  PASSWORD_RESET = "password_reset",
}

@Entity("tokens")
export class Token {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  @Index()
  userId: string;

  @Column()
  @Index()
  token: string;

  @Column({
    type: "enum",
    enum: TokenType,
  })
  type: TokenType;

  @ManyToOne(() => User, (user) => user.tokens, { onDelete: "CASCADE" })
  user: User;

  @Column()
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
