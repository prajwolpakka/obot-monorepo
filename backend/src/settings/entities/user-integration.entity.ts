import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('user_integrations')
export class UserIntegration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: string; // 'slack', 'teams', 'zapier', etc.

  @Column({ default: false })
  enabled: boolean;

  @Column('json', { nullable: true })
  config: any; // Store integration-specific config

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User)
  user: User;

  @Column()
  userId: string;
}