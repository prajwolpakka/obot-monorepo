import { Exclude } from "class-transformer";
import { Column, CreateDateColumn, JoinColumn, ManyToOne, UpdateDateColumn } from "typeorm";
import type { User } from "../../users/entities/user.entity";

export abstract class BaseEntity {
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  @Exclude()
  createdById: string;

  @Column({ nullable: true })
  @Exclude()
  updatedById: string;

  @ManyToOne("User", { nullable: true })
  @JoinColumn({ name: "createdById" })
  createdBy: User;

  @ManyToOne("User", { nullable: true })
  @JoinColumn({ name: "updatedById" })
  updatedBy: User;
}
