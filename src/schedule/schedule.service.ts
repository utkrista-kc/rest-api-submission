import { Injectable } from '@nestjs/common';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { PrismaService } from '../prisma/prisma.service';
import { IScheduleService } from './schedule.interface';
import { Schedule } from '@prisma/client';

@Injectable()
export class ScheduleService implements IScheduleService {
  constructor(private readonly prisma: PrismaService) {}

  create(createScheduleDto: CreateScheduleDto): Promise<Schedule> {
    return this.prisma.schedule.create({
      data: createScheduleDto,
    });
  }

  findAll(): Promise<Schedule[]> {
    return this.prisma.schedule.findMany({
      where: { is_active: true },
    });
  }

  findOne(id: string): Promise<Schedule> {
    return this.prisma.schedule.findUnique({
      where: { id, is_active: true },
    });
  }

  update(id: string, updateScheduleDto: UpdateScheduleDto): Promise<Schedule> {
    return this.prisma.schedule.update({
      where: { id: id, is_active: true },
      data: updateScheduleDto,
    });
  }

  async remove(id: string): Promise<Schedule> {
    return this.prisma.schedule.update({
      where: { id: id },
      data: { is_active: false },
    });
  }
}
