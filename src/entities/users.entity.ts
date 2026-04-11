import { Column, Entity, Index, OneToMany } from 'typeorm';
import { Post, Comment, Reply } from '../entities';
import { SharedColumns } from './shared-columns';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

@Entity({ name: 'users' })
export class User extends SharedColumns {
  @Column({ nullable: true })
  @Index('unique_username', { unique: true })
  username: string;

  @Column()
  @Index('unique_email', { unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];
  @OneToMany(() => Comment, (comment) => comment.author)
  comments: Comment[];
  @OneToMany(() => Reply, (reply) => reply.author)
  replies: Reply[];
}
