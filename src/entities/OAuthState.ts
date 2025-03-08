import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { User } from './User.js';

@Entity('oauth_state')
export class OAuthState {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  @Index()
  state!: string;

  @ManyToOne(() => User, (user) => user.oauthStates)
  @JoinColumn({
    name: 'userId'
  })
  user!: Relation<User>;
}
