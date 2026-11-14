import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { IsNumber, IsString } from 'class-validator';
import { Task } from '../task/entities/task.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  @IsNumber()
  @ApiProperty()
  id?: number;

  @Column()
  @IsString()
  @ApiProperty()
  name?: string;

  @Column({ nullable: true })
  @IsString()
  @ApiProperty()
  email!: string;

  @Column()
  @IsString()
  @ApiProperty()
  password!: string;

  @ApiProperty()
  @Column({ default: 'user' })
  role?: string;

  @Column('simple-array', { nullable: true })
  @OneToMany(() => Task, (task) => task.user)
  tasks?: Task[];
}
