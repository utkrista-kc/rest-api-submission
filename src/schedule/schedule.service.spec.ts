import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleService } from './schedule.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ScheduleService', () => {
  let service: ScheduleService;

  // Dynamic mocking can be used later with jest-mock-extended
  const prismaMock = {
    schedule: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScheduleService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<ScheduleService>(ScheduleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('ScheduleService - create', () => {
    it('should successfully create a schedule', async () => {
      const dto = {
        account_id: 1,
        agent_id: 2,
        start_time: new Date('2024-05-01 11:00 AM'),
        end_time: new Date('2024-05-01 11:00 PM'),
        is_active: true,
      };
      const expectedSchedule = { id: '1', ...dto };
      prismaMock.schedule.create.mockResolvedValue(expectedSchedule);
      const result = await service.create(dto);
      expect(result).toEqual(expectedSchedule);
      expect(prismaMock.schedule.create).toHaveBeenCalledWith({
        data: dto,
      });
    });
  });

  describe('ScheduleService - findOne', () => {
    beforeEach(() => {
      prismaMock.schedule.findUnique.mockClear();
    });

    it('should return a single schedule', async () => {
      const id = 'valid';
      const expectedSchedule = {
        id: 'valid',
        account_id: 1,
        agent_id: 2,
        start_time: new Date('2024-05-01 11:00 AM'),
        end_time: new Date('2024-05-01 11:00 PM'),
        is_archived: true,
      };

      prismaMock.schedule.findUnique.mockResolvedValue(expectedSchedule);

      const result = await service.findOne(id);
      expect(result).toEqual(expectedSchedule);
      expect(prismaMock.schedule.findUnique).toHaveBeenCalledWith({
        where: { id, is_active: true },
      });
    });

    it('should return null if no schedule present', async () => {
      const id = 'invalid-valid';
      prismaMock.schedule.findUnique.mockResolvedValue(null);
      const result = await service.findOne(id);
      expect(result).toEqual(null);
    });
  });

  describe('ScheduleService - findAll', () => {
    it('should return all schedules', async () => {
      const allSchedules = [
        {
          id: 'valid2',
          account_id: 1,
          agent_id: 2,
          start_time: new Date('2024-05-01 11:00 AM'),
          end_time: new Date('2024-05-01 11:00 PM'),
          is_archived: true,
        },
        {
          id: 'valid2',
          account_id: 1,
          agent_id: 2,
          start_time: new Date('2024-05-01 11:00 AM'),
          end_time: new Date('20024-05-01 11:00 PM'),
          is_archived: true,
        },
      ];

      prismaMock.schedule.findMany.mockResolvedValue(allSchedules);

      const result = await service.findAll();
      expect(result).toEqual(allSchedules);
    });

    it('should return empty array if there are no schedules', async () => {
      prismaMock.schedule.findMany.mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('ScheduleService - update', () => {
    it('should update a schedule', async () => {
      const id = '1';
      const updateDto = {
        account_id: 1,
        agent_id: 2,
        start_time: new Date('2024-05-01 11:00 AM'),
        end_time: new Date('2024-05-01 11:00 PM'),
        is_archived: true,
      };
      const expectedSchedule = { id, ...updateDto, is_active: true };

      prismaMock.schedule.update.mockResolvedValue(expectedSchedule);

      const result = await service.update(id, updateDto);
      expect(result).toEqual(expectedSchedule);
      expect(prismaMock.schedule.update).toHaveBeenCalledWith({
        where: { id, is_active: true },
        data: updateDto,
      });
    });
  });

  describe('ScheduleService - remove', () => {
    it('should deactivate a schedule', async () => {
      const id = '1';
      const expectedSchedule = { id, is_active: false };

      prismaMock.schedule.update.mockResolvedValue(expectedSchedule);

      const result = await service.remove(id);
      expect(result).toEqual(expectedSchedule);
      expect(prismaMock.schedule.update).toHaveBeenCalledWith({
        where: { id },
        data: { is_active: false },
      });
    });
  });
});
