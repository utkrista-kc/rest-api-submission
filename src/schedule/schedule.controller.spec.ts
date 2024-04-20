import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

describe('ScheduleController', () => {
  let controller: ScheduleController;

  const mockScheduleService = {
    create: jest.fn(),
    findOne: jest.fn().mockResolvedValue({}),
    findAll: jest.fn(),
    remove: jest.fn(),
    update: jest
      .fn()
      .mockImplementation((id, dto) => Promise.resolve({ id, ...dto })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScheduleController],
      providers: [ScheduleService],
    })
      .overrideProvider(ScheduleService)
      .useValue(mockScheduleService)
      .compile();

    controller = module.get<ScheduleController>(ScheduleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('ScheduleController create', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should create a schedule', async () => {
      const dto = {
        account_id: 1,
        agent_id: 2,
        start_time: new Date('2024-05-01 11:00 AM'),
        end_time: new Date('20024-05-01 11:00 PM'),
      };
      mockScheduleService.create.mockReturnValue({
        id: 'valid-id',
        ...dto,
      });
      const expectedResponse = { id: 'valid-id', ...dto };

      const result = await controller.create(dto);

      expect(result).toEqual(expectedResponse);
      expect(mockScheduleService.create).toHaveBeenCalledWith(dto);
    });

    it('should throw NotFoundException when the service throws NotFoundException', async () => {
      const dto = {
        account_id: 1,
        agent_id: 2,
        end_time: new Date('20024-05-01 11:00 PM'),
        start_time: new Date('2024-05-01 11:00 AM'),
      };
      const errorMessage = 'Invalid data provided';
      mockScheduleService.create.mockRejectedValue(
        new NotFoundException(errorMessage),
      );

      await expect(controller.create(dto)).rejects.toThrow(NotFoundException);
      await expect(controller.create(dto)).rejects.toThrow(errorMessage);
    });
  });

  describe('ScheduleController - update', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should update a schedule', async () => {
      const dto = {
        account_id: 1,
        agent_id: 2,
        start_time: new Date('2024-05-01 11:00 AM'),
        end_time: new Date('20024-05-01 11:00 PM'),
      };
      const updatedResult = await controller.update('1', dto);
      expect(updatedResult).toEqual({
        id: '1',
        ...dto,
      });
      expect(mockScheduleService.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException if schedule not found', async () => {
      const dto = {
        account_id: 1,
        agent_id: 2,
        start_time: new Date(),
        end_time: new Date(),
      };
      const scheduleId = '2';
      mockScheduleService.findOne.mockResolvedValue(null); // Mocking no schedule found

      await expect(controller.update(scheduleId, dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockScheduleService.findOne).toHaveBeenCalledWith(scheduleId);
      expect(mockScheduleService.update).not.toHaveBeenCalled(); // Make sure update is not called
    });
  });

  describe('ScheduleController - findOne', () => {
    beforeEach(() => {
      mockScheduleService.findOne.mockReset();
    });

    it('should return a schedule if it exists', async () => {
      const dto = {
        id: 'valid',
        account_id: 1,
        agent_id: 2,
        start_time: new Date('2024-05-01 11:00 AM'),
        end_time: new Date('20024-05-01 11:00 PM'),
      };
      mockScheduleService.findOne.mockResolvedValue(dto);

      const result = await controller.findOne('valid');
      expect(result).toEqual(dto);
      expect(mockScheduleService.findOne).toHaveBeenCalledWith('valid');
    });

    it('should throw NotFoundException if the schedule does not exist', async () => {
      mockScheduleService.findOne.mockResolvedValue(null);

      await expect(controller.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockScheduleService.findOne).toHaveBeenCalledWith('invalid-id');
    });
  });

  describe('ScheduleController - findAll', () => {
    beforeEach(() => {
      mockScheduleService.findAll.mockReset();
    });

    it('should return all schedules', async () => {
      const schedules = [
        {
          id: 'valid1',
          account_id: 1,
          agent_id: 2,
          start_time: new Date('2024-05-01 11:00 AM'),
          end_time: new Date('20024-05-01 11:00 PM'),
        },
        {
          id: 'valid2',
          account_id: 2,
          agent_id: 2,
          start_time: new Date('2024-06-01 11:00 AM'),
          end_time: new Date('20024-06-01 11:00 PM'),
        },
      ];
      mockScheduleService.findAll.mockResolvedValue(schedules);

      const result = await controller.findAll();
      expect(result).toEqual(schedules);
      expect(mockScheduleService.findAll).toHaveBeenCalled();
    });

    it('should handle errors and throw InternalServerErrorException', async () => {
      mockScheduleService.findAll.mockRejectedValue(
        new Error('Unexpected Error'),
      );

      await expect(controller.findAll()).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockScheduleService.findAll).toHaveBeenCalled();
    });
  });

  describe('ScheduleController - remove', () => {
    beforeEach(() => {
      jest.clearAllMocks(); // Reset all mocks
      mockScheduleService.remove.mockReset();
    });

    it('should delete a schedule if it exists', async () => {
      mockScheduleService.findOne.mockResolvedValue({ id: 'valid-id' });
      mockScheduleService.remove.mockResolvedValue({});

      await expect(controller.remove('valid-id')).resolves.toEqual({});
      expect(mockScheduleService.findOne).toHaveBeenCalledWith('valid-id');
      expect(mockScheduleService.remove).toHaveBeenCalledWith('valid-id');
    });

    it('should throw NotFoundException if the schedule does not exist', async () => {
      mockScheduleService.findOne.mockResolvedValue(null);

      await expect(controller.remove('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockScheduleService.findOne).toHaveBeenCalledWith('invalid-id');
      expect(mockScheduleService.remove).not.toHaveBeenCalled();
    });
  });
});
