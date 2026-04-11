import { Column, Entity, ManyToOne } from 'typeorm';
import { User } from '../entities';
import { SharedColumns } from './shared-columns';

@Entity({ name: 'posts' })
export class Post extends SharedColumns {
  @Column('text')
  content: string;

  @ManyToOne(() => User, (user) => user.posts, { onDelete: 'CASCADE' })
  author: User;
}
