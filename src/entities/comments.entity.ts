import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Post, Reply, User } from '../entities';
import { SharedColumns } from './shared-columns';

@Entity({ name: 'comments' })
export class Comment extends SharedColumns {
  @Column('text')
  content: string;

  @ManyToOne(() => User, (user) => user.comments, { onDelete: 'CASCADE' })
  author: User;

  @Column()
  authorId: string;

  @ManyToOne(() => Post, (post) => post.comments, { onDelete: 'CASCADE' })
  relatedPost: Post;

  @Column()
  relatedPostId: string;

  @OneToMany(() => Reply, (reply) => reply.relatedComment)
  replies: Reply[];
}
