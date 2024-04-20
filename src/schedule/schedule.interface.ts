import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

export interface ISchedule {
  account_id: number;
  agent_id: number;
  start_time: Date;
  end_time: Date;
}

export interface IScheduleService {
  findAll(): Promise<ISchedule[]>;
  findOne(id: string): Promise<ISchedule>;
  create(createScheduleDto: CreateScheduleDto): Promise<ISchedule>;
  update(id: string, updateScheduleDto: UpdateScheduleDto): Promise<ISchedule>;
  remove(id: string): Promise<ISchedule>;
}
