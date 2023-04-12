const { expect, test } = require('@jest/globals');
const { MockResponse } = require('./mocks');
const { getMockUser } = require('./testUtils');
const ScheduleService = require('../modules/schedules');
const ScheduleDayService = require('../modules/scheduleDays');
const db = require('./dbUtil');

beforeAll(async () => {
    await db.connect()
    process.env.JWT_TOKEN = 'token';
});
beforeEach(async () => await db.clear());
afterAll(async () => await db.close()); 

describe('ScheduleDays Schema', () => {
    test('createScheduleDay', async () => {
        const user = await getMockUser();
        const date = new Date();
        
        const schedule = await ScheduleService.createSchedule({ startDay: date, userID: user._id });
        
        // try to create schedule day for non-existing schedule
        await expect(ScheduleDayService.createScheduleDay({ dayOffset: 0, scheduleID: schedule.user })).rejects.toThrow(Error);

        // create schedule day
        const scheduleDay = await ScheduleDayService.createScheduleDay({ dayOffset: 0, scheduleID: schedule._id });
        expect(scheduleDay).toBeTruthy();
        expect(scheduleDay).toHaveProperty('dayOffset', 0);
        expect(scheduleDay).toHaveProperty('schedule', schedule._id);

        // trying to create duplicate schedule day
        await expect(ScheduleDayService.createScheduleDay({ dayOffset: 0, scheduleID: schedule._id })).rejects.toThrow(Error);
    });

    test('getScheduleDays', async () => {
        const user = await getMockUser();
        const date = new Date();
        
        const schedule = await ScheduleService.createSchedule({ startDay: date, userID: user._id });
        const scheduleDayA = await ScheduleDayService.createScheduleDay({ dayOffset: 0, scheduleID: schedule._id });
        const scheduleDayB = await ScheduleDayService.createScheduleDay({ dayOffset: 1, scheduleID: schedule._id });

        const scheduleDays = await ScheduleDayService.getScheduleDays({ scheduleID: schedule._id });
        expect(scheduleDays).toBeTruthy();
        expect(scheduleDays.length).toBe(2);
    });

    test('deleteScheduleDay', async () => {
        const user = await getMockUser();
        const date = new Date();
        
        const schedule = await ScheduleService.createSchedule({ startDay: date, userID: user._id });
        const scheduleDay = await ScheduleDayService.createScheduleDay({ dayOffset: 0, scheduleID: schedule._id });

        // trying to delete non-existing schedule
        await expect(ScheduleDayService.deleteScheduleDay({ dayOffset: 0, scheduleID: schedule.user })).rejects.toThrow(Error);

        // deleting an existing schedule day
        const val = await ScheduleDayService.deleteScheduleDay({ dayOffset: 0, scheduleID: schedule._id });
        expect(val).toBe(true);
    });
});