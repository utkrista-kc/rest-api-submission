import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { UpdateScheduleDto } from '../dto/update-schedule.dto';

@Injectable()
export class ScheduleUpdateValidationPipe implements PipeTransform {
  async transform(value: UpdateScheduleDto) {
    const object = plainToClass(UpdateScheduleDto, value, {});

    const errors = await validate(object, { skipMissingProperties: true }); // Validate input

    if (errors.length > 0) {
      const errorMessage = errors
        .map((err) => Object.values(err.constraints).join(', '))
        .join('; ');
      throw new BadRequestException(errorMessage);
    }

    // Validate start_time and end_time
    if (
      typeof value === 'object' &&
      value.start_time != undefined &&
      value.end_time != undefined
    ) {
      value.start_time = new Date(value.start_time);

      value.end_time = new Date(value.end_time);

      if (value.start_time < new Date() || value.end_time < new Date()) {
        throw new BadRequestException(
          'Start and end dates must be in the future',
        );
      }

      if (value.start_time >= value.end_time) {
        throw new BadRequestException('End date must be after the start date');
      }

      return value;
    } else if (typeof value === 'string') {
      return value;
    } else if (
      (typeof value === 'object' &&
        value.start_time == undefined &&
        value.end_time != undefined) ||
      (value.start_time != undefined && value.end_time == undefined)
    ) {
      // Not allowing only start or end date times to prevent bad representation of schedule time
      // Can be allowed if check added on controller before update.
      throw new BadRequestException('Send both start and end time for update');
    } else {
      return value;
    }
  }
}
