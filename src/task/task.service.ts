import { Injectable } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ITaskService } from './task.interface';
import { Prisma, Task } from '@prisma/client';
@Injectable()
export class TaskService implements ITaskService {
  constructor(private readonly prisma: PrismaService) {}

  create(createTaskDto: CreateTaskDto): Promise<Task> {
    const { schedule_id, ...restOther } = createTaskDto;
    const data: Prisma.TaskCreateInput = {
      ...restOther,
      schedule: { connect: { id: schedule_id } },
    };

    const createdTask = this.prisma.task.create({
      data,
    });
    return createdTask;
  }

  findAll(scheduleId?: string): Promise<Task[]> {
    return this.prisma.task.findMany({
      where: { is_active: true, schedule_id: scheduleId },
      include: {
        schedule: true, // Include the schedule field
      },
    });
  }

  findOne(id: string): Promise<Task> {
    return this.prisma.task.findUnique({
      where: { id, is_active: true },
      include: {
        schedule: true, // Include the schedule field
      },
    });
  }

  update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const data: Prisma.TaskUpdateInput = {
      ...updateTaskDto,
    };

    return this.prisma.task.update({
      where: { id, is_active: true },
      data,
    });
  }

  remove(id: string): Promise<Task> {
    return this.prisma.task.update({
      where: { id: id },
      data: { is_active: false },
    });
  }
}
