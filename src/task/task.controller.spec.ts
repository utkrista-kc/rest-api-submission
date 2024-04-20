import { Test, TestingModule } from '@nestjs/testing';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskType } from '../task/task.interface';
import { ScheduleService } from '../schedule/schedule.service';
import { PrismaModule } from '../prisma/prisma.module';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

describe('TaskController', () => {
  let controller: TaskController;

  const mockTaskService = {
    create: jest.fn(),
    findOne: jest.fn().mockResolvedValue({}),
    findAll: jest.fn(),
    remove: jest.fn().mockResolvedValue({}),
    update: jest
      .fn()
      .mockImplementation((id, dto) => Promise.resolve({ id, ...dto })),
  };

  // Task Input  Data
  const dto: CreateTaskDto = {
    account_id: 1,
    schedule_id: 'schedule-valid-id',
    start_time: new Date('2024-05-01 11:00 AM'),
    duration: 30,
    type: TaskType.work,
  };

  const mockScheduleService = {
    findOne: jest.fn().mockImplementation((scheduleId) =>
      Promise.resolve(
        scheduleId === 'schedule-valid-id'
          ? {
              id: 'schedule-valid-id',
              start_time: '2024-06-01T09:00:00Z',
              end_time: '2024-07-01T17:00:00Z',
            }
          : null,
      ),
    ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      controllers: [TaskController],
      providers: [TaskService, ScheduleService],
    })
      .overrideProvider(TaskService)
      .useValue(mockTaskService)
      .overrideProvider(ScheduleService)
      .useValue(mockScheduleService)
      .compile();

    controller = module.get<TaskController>(TaskController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('TaskController create', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should create a schedule', async () => {
      mockTaskService.create.mockResolvedValue({
        id: 'valid-id',
        ...dto,
      });
      const expectedResponse = { id: 'valid-id', ...dto };

      const result = await controller.create(dto);

      expect(result).toEqual(expectedResponse);
      expect(mockTaskService.create).toHaveBeenCalledWith(dto);
    });

    it('should throw NotFoundException if schedule is not found', async () => {
      const createTaskDto: CreateTaskDto = {
        account_id: 1,
        schedule_id: 'schedule-invalid-id',
        start_time: new Date('2024-05-01 11:00 AM'),
        duration: 30,
        type: TaskType.work,
      };

      await expect(controller.create(createTaskDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('Task Controller - findOne', () => {
    beforeEach(() => {
      mockTaskService.findOne.mockReset();
    });

    it('should return a task if it exists', async () => {
      mockTaskService.findOne.mockResolvedValue(dto);

      const result = await controller.findOne('valid');
      expect(result).toEqual(dto);
      expect(mockTaskService.findOne).toHaveBeenCalledWith('valid');
    });

    it('should throw NotFoundException if the task does not exist', async () => {
      mockTaskService.findOne.mockResolvedValue(null);

      await expect(controller.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockTaskService.findOne).toHaveBeenCalledWith('invalid-id');
    });
  });

  describe('TaskController - findAll', () => {
    beforeEach(() => {
      mockTaskService.findAll.mockReset();
    });

    it('should return all tasks', async () => {
      const tasks = [
        {
          id: 'valid1',
          account_id: 1,
          schedule_id: 'schedule-valid-id',
          start_time: new Date('2024-05-01 11:00 AM'),
          duration: 30,
          type: TaskType.work,
        },
        {
          id: 'valid2',
          account_id: 1,
          schedule_id: 'schedule-valid-id',
          start_time: new Date('2024-05-01 11:00 AM'),
          duration: 30,
          type: TaskType.work,
        },
      ];
      mockTaskService.findAll.mockResolvedValue(tasks);

      const result = await controller.findAll();
      expect(result).toEqual(tasks);
      expect(mockTaskService.findAll).toHaveBeenCalled();
    });

    it('should handle errors and throw InternalServerErrorException', async () => {
      mockTaskService.findAll.mockRejectedValue(new Error('Unexpected Error'));

      await expect(controller.findAll()).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockTaskService.findAll).toHaveBeenCalled();
    });
  });

  describe('TaskController - remove', () => {
    beforeEach(() => {
      jest.clearAllMocks(); // Reset all mocks
      mockTaskService.remove.mockReset();
    });

    it('should delete a task if it exists', async () => {
      mockTaskService.findOne.mockResolvedValue({ id: 'valid-id' });
      mockTaskService.remove.mockResolvedValue({});

      await expect(controller.remove('valid-id')).resolves.toEqual({});
      expect(mockTaskService.remove).toHaveBeenCalledWith('valid-id');
    });

    it('should throw NotFoundException if the task does not exist', async () => {
      mockTaskService.findOne.mockResolvedValue(null);

      await expect(controller.remove('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockTaskService.findOne).toHaveBeenCalledWith('invalid-id');
      expect(mockTaskService.remove).not.toHaveBeenCalled();
    });
  });

  describe('TaskController - update', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should update a task', async () => {
      mockTaskService.findOne.mockResolvedValue({
        id: 'valid-id',
        ...dto,
      });
      const updatedResult = await controller.update('valid-id', dto);
      expect(updatedResult).toEqual({
        id: 'valid-id',
        ...dto,
      });
      expect(mockTaskService.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException if task not found', async () => {
      const taskId = '2';
      mockTaskService.findOne.mockResolvedValue(null); // Mocking no task found

      await expect(controller.update(taskId, dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockTaskService.findOne).toHaveBeenCalledWith(taskId);
      expect(mockTaskService.update).not.toHaveBeenCalled(); // Make sure update is not called
    });
  });
});
