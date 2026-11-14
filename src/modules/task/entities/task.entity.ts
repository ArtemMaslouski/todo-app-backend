import { User } from 'src/modules/user/user.entity';
import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id!: number;

  @ApiProperty()
  @Column({ nullable: true })
  title!: string;

  @ApiProperty()
  @Column({ nullable: true })
  description!: string;

  @ApiProperty()
  @Column({ nullable: true })
  date!: string;

  @ApiProperty()
  @Column({ nullable: true })
  time!: string;

  @ManyToOne(() => User, (user) => user.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column()
  userId!: number;
}
