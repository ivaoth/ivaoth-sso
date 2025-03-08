import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('admin')
export class Admin {
  @PrimaryGeneratedColumn()
  id!: number;
  @Column()
  discord_id!: string;
}
