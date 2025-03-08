import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './User';

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
  user!: User;
}
