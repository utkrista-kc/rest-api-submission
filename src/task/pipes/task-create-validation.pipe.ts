import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateTaskDto } from '../dto/create-task.dto';

@Injectable()
export class TaskCreateValidationPipe implements PipeTransform {
  async transform(value: CreateTaskDto) {
    const object = plainToClass(CreateTaskDto, value, {});
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

    // Check for start date validation
    if (value.start_time < new Date()) {
      throw new BadRequestException(
        'Start datetime of task must be in the future',
      );
    }

    return value;
  }
}
