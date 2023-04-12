const { expect, test } = require('@jest/globals');
const { MockResponse } = require('./mocks');
const { getMockUser } = require('./testUtils');
const ScheduleService = require('../modules/schedules');
const db = require('./dbUtil');

beforeAll(async () => {
    await db.connect()
    process.env.JWT_TOKEN = 'token';
});
beforeEach(async () => await db.clear());
afterAll(async () => await db.close()); 

describe('Schedules Schema', () => {
    test('createSchedule', async () => {
        const user = await getMockUser();
        const date = new Date();
        
        const schedule = await ScheduleService.createSchedule({ startDay: date, userID: user._id });
        expect(schedule).toBeTruthy();
        expect(schedule).toHaveProperty('startDay', date);

        // try to create duplicate
        await expect(ScheduleService.createSchedule({ startDay: date, userID: user._id })).rejects.toThrow(Error);
    });

    test('getSchedules', async () => {
        const user = await getMockUser();
        
        const scheduleA = await ScheduleService.createSchedule({ startDay: new Date(), userID: user._id });
        const scheduleB = await ScheduleService.createSchedule({ startDay: new Date(), userID: user._id });

        const schedules = await ScheduleService.getSchedules({ userID: user._id });
        expect(schedules.length).toBe(2);
    });

    test('editSchedule', async () => {
        const user = await getMockUser();
        const date = new Date('2023-01-01');
        const schedule = await ScheduleService.createSchedule({ startDay: date, userID: user._id });

        // trying to edit non-existent schedule
        await expect(ScheduleService.editSchedule({ startDay: date, scheduleID: schedule.user })).rejects.toThrow(Error);

        // trying to change startDay to one that exists already
        await expect(ScheduleService.editSchedule({ startDay: date, scheduleID: schedule._id })).rejects.toThrow(Error);

        // trying to change startDay to one that exists already
        const editedSchedule = await ScheduleService.editSchedule({ startDay: new Date('2023-01-02'), scheduleID: schedule._id });
        expect(editedSchedule).toBeTruthy();
    });

    test('deleteSchedule', async () => {
        const user = await getMockUser();
        const date = new Date('2023-01-01');
        const schedule = await ScheduleService.createSchedule({ startDay: date, userID: user._id });

        // trying to delete a non-existent schedule
        await expect(ScheduleService.deleteSchedule({ startDay: date, userID: schedule._id })).rejects.toThrow(Error);

        // trying to delete an existing schedule
        const val = await ScheduleService.deleteSchedule({ startDay: date, userID: schedule.user });
        expect(val).toBe(true);
    });
});