import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from './task.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskType } from '../task/task.interface';

describe('TaskService', () => {
  let service: TaskService;

  // Dynamic mocking can be used later with jest-mock-extended
  const prismaMock = {
    task: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    },
  };

  // Task Input  Data
  const dto: CreateTaskDto = {
    account_id: 1,
    schedule_id: 'schedule-valid-id',
    start_time: new Date('2024-05-01 11:00 AM'),
    duration: 30,
    type: TaskType.work,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('TaskService - create', () => {
    it('should successfully create a task', async () => {
      const expectedTask = { id: '1', ...dto };
      prismaMock.task.create.mockResolvedValue(expectedTask);
      const result = await service.create(dto);
      expect(result.id).toBeDefined();
    });
  });

  describe('Taskervice - findOne', () => {
    beforeEach(() => {
      prismaMock.task.findUnique.mockClear();
    });

    it('should return a single task', async () => {
      const id = 'valid';
      const expectedTask = {
        id: 'valid',
        account_id: 1,
        agent_id: 2,
        start_time: new Date('2024-05-01 11:00 AM'),
        end_time: new Date('2024-05-01 11:00 PM'),
        is_archived: true,
      };

      prismaMock.task.findUnique.mockResolvedValue(expectedTask);

      const result = await service.findOne(id);
      expect(result).toEqual(expectedTask);
      expect(prismaMock.task.findUnique).toHaveBeenCalledWith({
        where: { id, is_active: true },
        include: {
          schedule: true, // Include the schedule field
        },
      });
    });

    it('should return null if no task present', async () => {
      const id = 'invalid-valid';
      prismaMock.task.findUnique.mockResolvedValue(null);
      const result = await service.findOne(id);
      expect(result).toEqual(null);
    });
  });

  describe('TaskService - findAll', () => {
    it('should return all tasks', async () => {
      const allTasks = [
        {
          id: 'valid2',
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

      prismaMock.task.findMany.mockResolvedValue(allTasks);

      const result = await service.findAll();
      expect(result).toEqual(allTasks);
    });

    it('should return empty array if there are no tasks', async () => {
      prismaMock.task.findMany.mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('TaskService - update', () => {
    it('should update a task', async () => {
      const id = '1';
      const updateDto = {
        account_id: 1,
        schedule_id: 'schedule-valid-id',
        start_time: new Date('2024-05-01 11:00 AM'),
        duration: 30,
        type: TaskType.work,
      };
      const expectedTask = { id, ...updateDto, is_active: true };

      prismaMock.task.update.mockResolvedValue(expectedTask);

      const result = await service.update(id, updateDto);
      expect(result).toEqual(expectedTask);
      expect(prismaMock.task.update).toHaveBeenCalledWith({
        where: { id, is_active: true },
        data: updateDto,
      });
    });
  });

  describe('TaskService - remove', () => {
    it('should deactivate a task', async () => {
      const id = '1';
      const expectedTask = { id, is_active: false };

      prismaMock.task.update.mockResolvedValue(expectedTask);

      const result = await service.remove(id);
      expect(result).toEqual(expectedTask);
      expect(prismaMock.task.update).toHaveBeenCalledWith({
        where: { id },
        data: { is_active: false },
      });
    });
  });
});
