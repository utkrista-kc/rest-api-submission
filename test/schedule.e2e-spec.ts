import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ScheduleModule } from '../src/schedule/schedule.module';
import { any } from 'jest-mock-extended';

describe('ScheduleController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ScheduleModule],
    })

      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('GET schedules/:id', () => {
    it('should create a schedule and then fetch that schedule by ID', async () => {
      const newScheduleData = {
        account_id: 100,
        agent_id: 201,
        start_time: '2024-05-01 11:00 AM',
        end_time: '2024-05-01 11:00 PM',
      };

      const createResponse = await request(app.getHttpServer())
        .post('/schedules')
        .send(newScheduleData)
        .expect(201);

      const scheduleId = createResponse.body.id; // Retrieving  ID

      // Fetch the created schedule by ID
      const fetchResponse = await request(app.getHttpServer())
        .get(`/schedules/${scheduleId}`)
        .expect(200);

      expect(fetchResponse.body).toEqual({
        id: scheduleId,
        is_active: true,
        account_id: newScheduleData.account_id,
        agent_id: newScheduleData.agent_id,
        start_time: new Date(newScheduleData.start_time).toISOString(),
        end_time: new Date(newScheduleData.end_time).toISOString(),
      });
    });

    it('should return 400 BAD REQUEST for NOT FOUND ID', async () => {
      await request(app.getHttpServer()).get('/schedules/2').expect(404);
    });
  });

  describe('GET /schedules', () => {
    it('should fetch all schedules', async () => {
      const response = await request(app.getHttpServer())
        .get('/schedules')
        .expect(200);
      expect(Array.isArray(response.body)).toBe(true); // Check response is array
    });
  });

  describe('DELETE /schedules/:id', () => {
    it('should successfully delete a schedule', async () => {
      // Firstly, create a schedule
      const newScheduleData = {
        account_id: 100,
        agent_id: 201,
        start_time: '2024-05-01 11:00 AM',
        end_time: '2024-05-01 11:00 PM',
      };

      const createResponse = await request(app.getHttpServer())
        .post('/schedules')
        .send(newScheduleData)
        .expect(201);

      const scheduleId = createResponse.body.id;

      // Now, delete the created schedule
      const deletedResponse = await request(app.getHttpServer())
        .delete(`/schedules/${scheduleId}`)
        .expect(200); // Expect No Content on successful deletion

      expect(deletedResponse.body.is_active).toBe(false); // Check the change in active status.
    });

    it('DELETE /schedules/:id - should handle invalid scheduleID', async () => {
      await request(app.getHttpServer())
        .delete('/schedules/1') // Assuming '1' is a invalid ID
        .expect(404); // Expect Not Found
    });
  });

  describe('POST /schedules', () => {
    it('should create a new schedule and return the created schedule', async () => {
      const newScheduleData = {
        account_id: 100,
        agent_id: 201,
        start_time: '2024-05-01 11:00 AM',
        end_time: '2024-05-01 11:00 PM',
      };

      const response = await request(app.getHttpServer())
        .post('/schedules')
        .send(newScheduleData)
        .expect(201); // Assert status code for creation

      // Check response structure
      expect(response.body).toHaveProperty('id');
      expect(response.body).toEqual({
        id: any(String),
        is_active: true,
        account_id: newScheduleData.account_id,
        agent_id: newScheduleData.agent_id,
        start_time: new Date(newScheduleData.start_time).toISOString(),
        end_time: new Date(newScheduleData.end_time).toISOString(),
      });
    });

    it('should return 400 BAD REQUEST if required fields are missing', async () => {
      const incompleteData = {
        account_id: 1, // Missing fields like agent_id, start_time, end_time
      };

      await request(app.getHttpServer())
        .post('/schedules')
        .send(incompleteData)
        .expect(400); // Check request fails without required fields
    });

    it('should check start datetime and end datetime be in future', async () => {
      const newScheduleData = {
        account_id: 100,
        agent_id: 201,
        start_time: '2022-05-01 11:00 AM',
        end_time: '2022-05-01 11:00 PM',
      };

      await request(app.getHttpServer())
        .post('/schedules')
        .send(newScheduleData)
        .expect(400); // Assert status code for creation
    });

    it('should check start dateime is earlier and end datetime', async () => {
      const newScheduleData = {
        account_id: 100,
        agent_id: 201,
        start_time: '2024-05-02 11:00 AM',
        end_time: '2024-05-01 11:00 PM',
      };

      await request(app.getHttpServer())
        .post('/schedules')
        .send(newScheduleData)
        .expect(400); // Assert status code for creation
    });
  });

  describe('PATCH /schedules/:id', () => {
    let scheduleId; // Store the ID of created schedule

    beforeAll(async () => {
      const newScheduleData = {
        account_id: 10,
        agent_id: 21,
        start_time: '2024-05-01 11:00 AM',
        end_time: '2024-05-01 11:00 PM',
      };

      const response = await request(app.getHttpServer())
        .post('/schedules')
        .send(newScheduleData)
        .expect(201); // Create a new schedule

      scheduleId = response.body.id; // Store the ID for later use
    });

    it('should update an existing schedule and return the updated schedule', async () => {
      const updateData = {
        agent_id: 3, // Changing the agent_id for the update
      };
      console.log(scheduleId);

      await request(app.getHttpServer())
        .patch(`/schedules/${scheduleId}`)
        .send(updateData)
        .expect(200) // Expect OK on successful update
        .then((response) => {
          expect(response.body.id).toEqual(scheduleId);
          expect(response.body.agent_id).toEqual(updateData.agent_id);
        });
    });

    it('should return 404 NOT FOUND when trying to update a non-existing schedule', async () => {
      const nonExistingId = 'non-existing-id';
      await request(app.getHttpServer())
        .patch(`/schedules/${nonExistingId}`)
        .send({ agent_id: 3 })
        .expect(404); // Expect Not Found for non-existing resource
    });

    it('should send both start datetime and end datetime when updating', async () => {
      const updateData = {
        start_time: '2024-05-01 11:00 PM', // Changing the agent_id for the update
      };

      await request(app.getHttpServer())
        .patch(`/schedules/${scheduleId}`)
        .send(updateData)
        .expect(400); // Expect 400
    });

    it('should check start datetime and end datetime be in future', async () => {
      const updateData = {
        start_time: '2022-05-01 11:00 AM',
        end_time: '2022-05-01 11:00 PM',
      };

      await request(app.getHttpServer())
        .patch(`/schedules/${scheduleId}`)
        .send(updateData)
        .expect(400); // Expect 400
    });

    it('should check start dateime is earlier and end datetime', async () => {
      const updateData = {
        start_time: '2022-05-01 11:00 AM',
        end_time: '2022-04-28 11:00 PM',
      };

      await request(app.getHttpServer())
        .patch(`/schedules/${scheduleId}`)
        .send(updateData)
        .expect(400); // Expect 400n
    });
  });
});
