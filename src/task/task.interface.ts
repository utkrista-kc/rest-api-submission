import { UpdateTaskDto } from './dto/update-task.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { Task } from '@prisma/client';

export enum TaskType {
  break = 'break',
  work = 'work',
}

export interface ITask {
  account_id: number;
  schedule_id: string;
  start_time: Date;
  duration: number;
  type: TaskType;
}

export interface ITaskService {
  findAll(): Promise<Task[]>;
  findOne(id: string): Promise<Task>;
  create(createTaskDto: CreateTaskDto): Promise<Task>;
  create(createTaskDto: CreateTaskDto): Promise<Task>;
  update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task>;
  remove(id: string): Promise<Task>;
}
