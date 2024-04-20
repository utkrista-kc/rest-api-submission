import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateScheduleDto } from '../dto/create-schedule.dto';

@Injectable()
export class ScheduleCreateValidationPipe implements PipeTransform {
  async transform(value: CreateScheduleDto) {
    const object = plainToClass(CreateScheduleDto, value, {});
    const errors = await validate(object); // Validate input

    if (errors.length > 0) {
      const errorMessage = errors
        .map((err) => Object.values(err.constraints).join(', '))
        .join('; ');
      throw new BadRequestException(errorMessage);
    }

    if (value.start_time) {
      value.start_time = new Date(value.start_time);
    }

    if (value.end_time) {
      value.end_time = new Date(value.end_time);
    }

    // Check for date range validation

    if (value.start_time < new Date() || value.end_time < new Date()) {
      throw new BadRequestException(
        'Start and end dates must be in the future',
      );
    }

    if (value.start_time >= value.end_time) {
      throw new BadRequestException('End date must be after the start date');
    }

    return value;
  }
}
