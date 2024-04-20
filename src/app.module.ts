import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ScheduleModule } from './schedule/schedule.module';
import { TaskModule } from './task/task.module';

@Module({
  imports: [PrismaModule, ScheduleModule, TaskModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
