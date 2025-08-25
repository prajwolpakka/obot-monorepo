import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('user_preferences')
export class UserPreferences {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 'en' })
  language: string;

  @Column({ default: 'light' })
  theme: 'light' | 'dark' | 'system';

  @Column({ default: true })
  emailNotifications: boolean;

  @Column({ default: false })
  pushNotifications: boolean;

  @Column({ default: 'UTC' })
  timezone: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Column()
  userId: string;
}