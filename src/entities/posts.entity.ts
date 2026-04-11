import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Comment, User } from '../entities';
import { SharedColumns } from './shared-columns';

@Entity({ name: 'posts' })
export class Post extends SharedColumns {
  @Column('text')
  content: string;

  @ManyToOne(() => User, (user) => user.posts, { onDelete: 'CASCADE' })
  author: User;

  @Column()
  authorId: string;

  @OneToMany(() => Comment, (comment) => comment.relatedPost)
  comments: Comment[];
}
