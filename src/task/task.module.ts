import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ScheduleService } from 'src/schedule/schedule.service';

@Module({
  imports: [PrismaModule],
  controllers: [TaskController],
  providers: [TaskService, ScheduleService],
})
export class TaskModule {}
