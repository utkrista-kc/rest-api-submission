import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
} from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { ApiTags } from '@nestjs/swagger';
import { Schedule } from '@prisma/client';

import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ScheduleCreateValidationPipe } from './pipes/schedule-create-validation.pipe';
import { ScheduleUpdateValidationPipe } from './pipes/schedule-update-validation.pipe';
@ApiTags('Schedules')
@Controller('schedules')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  @UsePipes(new ScheduleCreateValidationPipe())
  async create(
    @Body() createScheduleDto: CreateScheduleDto,
  ): Promise<Schedule> {
    try {
      return await this.scheduleService.create(createScheduleDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }

  @Get()
  async findAll(): Promise<Schedule[]> {
    try {
      const schedules = await this.scheduleService.findAll();
      return schedules;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Schedule> {
    try {
      const schedule = await this.scheduleService.findOne(id);
      if (!schedule) {
        throw new NotFoundException(`Schedule with ID ${id} not found.`);
      }

      return schedule;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }

  @Patch(':id')
  @UsePipes(new ScheduleUpdateValidationPipe())
  async update(
    @Param('id') id: string,
    @Body() updateScheduleDto: UpdateScheduleDto,
  ): Promise<Schedule> {
    try {
      const schedule = await this.scheduleService.findOne(id);

      if (!schedule) {
        throw new NotFoundException(`Schedule with ID ${id} not found.`);
      }

      const updatedSchedule = this.scheduleService.update(
        id,
        updateScheduleDto,
      );
      return updatedSchedule;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<Schedule> {
    try {
      const schedule = await this.scheduleService.findOne(id);
      if (!schedule) {
        throw new NotFoundException(`Schedule with ID ${id} not found.`);
      }
      return await this.scheduleService.remove(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }
}
