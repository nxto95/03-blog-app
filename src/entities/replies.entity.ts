import { Column, Entity, ManyToOne } from 'typeorm';
import { User } from '../entities';
import { SharedColumns } from './shared-columns';

@Entity({ name: 'replies' })
export class Reply extends SharedColumns {
  @Column('text')
  content: string;

  @ManyToOne(() => User, (user) => user.replies, { onDelete: 'CASCADE' })
  author: User;
}
