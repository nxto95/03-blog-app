import { Column, Entity, ManyToOne } from 'typeorm';
import { User } from '../entities';
import { SharedColumns } from './shared-columns';

@Entity({ name: 'comments' })
export class Comment extends SharedColumns {
  @Column('text')
  content: string;

  @ManyToOne(() => User, (user) => user.comments, { onDelete: 'CASCADE' })
  author: User;
}
