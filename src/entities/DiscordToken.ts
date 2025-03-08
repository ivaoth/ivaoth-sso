import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { User } from './User.js';

@Entity('discord_token')
export class DiscordToken {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  access_token!: string;

  @Column()
  refresh_token!: string;

  @Column()
  expires_at!: Date;

  @OneToOne(() => User, (user) => user.discordToken)
  @JoinColumn({ name: 'userId' })
  user!: Relation<User>;
}
