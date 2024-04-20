import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ApiTags } from '@nestjs/swagger';
import { Task } from '@prisma/client';
import { TaskCreateValidationPipe } from './pipes/task-create-validation.pipe';
import { TaskUpdateValidationPipe } from './pipes/task-update-validation.pipe';
import { ScheduleService } from '../schedule/schedule.service';
import { ApiQuery } from '@nestjs/swagger';

@ApiTags('Tasks')
@Controller('tasks')
export class TaskController {
  constructor(
    private readonly taskService: TaskService,
    private readonly scheduleService: ScheduleService,
  ) {}

  @Post()
  @UsePipes(new TaskCreateValidationPipe())
  async create(@Body() createTaskDto: CreateTaskDto): Promise<Task> {
    try {
      const schedule = await this.scheduleService.findOne(
        createTaskDto.schedule_id,
      );

      if (!schedule) {
        throw new NotFoundException(
          `Schedule with ID ${createTaskDto.schedule_id} not found.`,
        );
      }
      // Calculate  end time of the task based on the start_time and duration
      const taskEndTime = new Date(createTaskDto.start_time);
      taskEndTime.setMinutes(taskEndTime.getMinutes() + createTaskDto.duration);

      // Check if task's time period is within the schedule's period
      if (
        createTaskDto.start_time < schedule.start_time ||
        taskEndTime > schedule.end_time
      ) {
        throw new BadRequestException(
          "Task time period is out of the schedule's valid period.",
        );
      }

      return await this.taskService.create(createTaskDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }

  @Get()
  @ApiQuery({
    name: 'schedule_id',
    required: false,
    description: 'Filter tasks by the schedule ID',
    type: String,
  })
  async findAll(@Query('schedule_id') scheduleId?: string): Promise<Task[]> {
    try {
      return await this.taskService.findAll(scheduleId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Task> {
    try {
      const task = await this.taskService.findOne(id);
      if (!task) {
        throw new NotFoundException(`Task with ID ${id} not found.`);
      }
      return task;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }

  @Patch(':id')
  @UsePipes(new TaskUpdateValidationPipe())
  async update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<Task> {
    try {
      const task = await this.taskService.findOne(id);
      if (!task) {
        throw new NotFoundException(`Task with ID ${id} not found.`);
      }
      // Determine the effective schedule_id to use
      const scheduleId = updateTaskDto.schedule_id || task.schedule_id;
      const schedule = await this.scheduleService.findOne(scheduleId);
      if (!schedule) {
        throw new NotFoundException(
          `Schedule with ID ${scheduleId} not found.`,
        );
      }

      // Validate time period if start_time or duration is being updated
      if (updateTaskDto.start_time || updateTaskDto.duration) {
        const newStartTime = updateTaskDto.start_time || task.start_time;
        const newDuration = updateTaskDto.duration || task.duration;
        const newEndTime = new Date(newStartTime);
        newEndTime.setMinutes(newEndTime.getMinutes() + newDuration);

        if (
          newStartTime < schedule.start_time ||
          newEndTime > schedule.end_time
        ) {
          throw new BadRequestException(
            "Task time period is out of the schedule's valid period.",
          );
        }
      }
      const updatedTask = await this.taskService.update(id, updateTaskDto);
      return updatedTask;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<Task> {
    try {
      const task = await this.taskService.findOne(id);
      if (!task) {
        throw new NotFoundException(`Task with ID ${id} not found.`);
      }
      return await this.taskService.remove(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }
}
