import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { OAuthState } from './OAuthState';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  discord_id: string;

  @Column()
  vid: string;

  @Column()
  firstname: string;

  @Column()
  lastname: string;

  @Column()
  rating: number;

  @Column()
  ratingatc: number;

  @Column()
  ratingpilot: number;

  @Column()
  division: string;

  @Column()
  country: string;

  @Column()
  staff: string;

  @Column()
  customNickname: string;

  @Column({
    nullable: true
  })
  consentTime: Date | null;

  @OneToMany(() => OAuthState, (state) => state.user)
  oauthStates: OAuthState[];
}
