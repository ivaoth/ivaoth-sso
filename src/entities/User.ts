import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Relation } from 'typeorm';
import { OAuthState } from './OAuthState.js';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  discord_id!: string;

  @Column()
  vid!: string;

  @Column()
  firstname!: string;

  @Column()
  lastname!: string;

  @Column()
  rating!: number;

  @Column({
    nullable: true,
    type: 'int'
  })
  ratingatc!: number | null;

  @Column({
    nullable: true,
    type: 'int'
  })
  ratingpilot!: number | null;

  @Column()
  division!: string;

  @Column()
  country!: string;

  @Column({
    nullable: true,
    type: 'text'
  })
  staff!: string | null;

  @Column({
    nullable: true,
    type: 'text'
  })
  customNickname!: string | null;

  @Column({
    nullable: true,
    type: 'datetime'
  })
  consentTime!: Date | null;

  @OneToMany(() => OAuthState, (state) => state.user)
  oauthStates!: Relation<OAuthState>[];
}
