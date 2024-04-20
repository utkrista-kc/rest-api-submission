import { ITask, TaskType } from '../task.interface';
import { IsInt, IsNotEmpty, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { dateTimeRegex } from '../../utils/helper';

export class CreateTaskDto implements ITask {
  @ApiProperty()
  @IsInt({ message: 'account_id should be integer' })
  @IsNotEmpty({ message: 'account_id cannot be empty' })
  account_id: number;

  @ApiProperty()
  @IsString({ message: 'schedule_id should be string' })
  @IsNotEmpty({ message: 'schedule_id cannot be empty' })
  schedule_id: string;

  @ApiProperty({ example: 'yyyy-mm-dd hh:mm AM/PM' })
  @Matches(dateTimeRegex, {
    message: 'start_time must be in "yyyy-mm-dd hh:mm AM/PM" format',
  })
  @IsNotEmpty({ message: 'start_time cannot be empty' })
  start_time: Date;

  @ApiProperty()
  @IsInt({ message: 'duration should be integer' })
  @IsNotEmpty({ message: 'duration cannot be empty' })
  duration: number;

  @ApiProperty({
    enum: TaskType,
    description: 'The type of the task (break or work)',
    example: `"work" or "break"`,
  })
  @IsNotEmpty({ message: 'task type cannot be empty' })
  type: TaskType;
}
