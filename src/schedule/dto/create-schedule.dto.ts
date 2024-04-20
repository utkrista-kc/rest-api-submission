import { IsInt, IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ISchedule } from '../schedule.interface';
import { dateTimeRegex } from '../../utils/helper';

export class CreateScheduleDto implements ISchedule {
  @ApiProperty()
  @IsInt({ message: 'account_id should be integer' })
  @IsNotEmpty({ message: 'account_id cannot be empty' })
  account_id: number;

  @ApiProperty()
  @IsInt({ message: 'agent_id should be integer' })
  @IsNotEmpty({ message: 'agent_id cannot be empty' })
  agent_id: number;

  @ApiProperty({ example: 'yyyy-mm-dd hh:mm AM/PM' })
  @Matches(dateTimeRegex, {
    message: 'start_time must be in "yyyy-mm-dd hh:mm AM/PM" format',
  })
  @IsNotEmpty({ message: 'start_time cannot be empty' })
  start_time: Date;

  @ApiProperty({ example: 'yyyy-mm-dd hh:mm AM/PM' })
  @Matches(dateTimeRegex, {
    message: 'end must be in "yyyy-mm-dd hh:mm AM/PM" format',
  })
  @IsNotEmpty({ message: 'end_time cannot be empty' })
  end_time: Date;
}
