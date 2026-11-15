import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { IsNumber, IsString } from 'class-validator';
import { Task } from '../task/entities/task.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  @IsNumber()
  id?: number;

  @Column()
  @IsString()
  name?: string;

  @Column({ nullable: true })
  @IsString()
  email!: string;

  @Exclude()
  @Column()
  @IsString()
  password!: string;

  @Column({ default: 'user' })
  role?: string;

  @Column('simple-array', { nullable: true })
  @OneToMany(() => Task, (task) => task.user)
  tasks?: Task[];

  @Column({ nullable: true })
  hashedRefreshToken!: string | null;
}
