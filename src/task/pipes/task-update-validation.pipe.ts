import { UpdateTaskDto } from './../dto/update-task.dto';
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()
export class TaskUpdateValidationPipe implements PipeTransform {
  async transform(value: UpdateTaskDto) {
    const object = plainToClass(UpdateTaskDto, value, {});

    const errors = await validate(object, { skipMissingProperties: true }); // Validate input

    if (errors.length > 0) {
      const errorMessage = errors
        .map((err) => Object.values(err.constraints).join(', '))
        .join('; ');
      throw new BadRequestException(errorMessage);
    }

    // Validate start_time
    if (typeof value === 'object' && value.start_time != undefined) {
      value.start_time = new Date(value.start_time);

      if (value.start_time < new Date()) {
        throw new BadRequestException(
          'Start date time of task must be in the future',
        );
      }

      return value;
    } else {
      return value;
    }
  }
}
