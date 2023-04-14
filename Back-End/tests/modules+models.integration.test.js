const { expect, test } = require('@jest/globals');

const db = require('./dbUtil');
const { getMockUser } = require('./testUtils');
const UserService = require('../modules/users');
const ScheduleService = require('../modules/schedules');
const ScheduleDayService = require('../modules/scheduleDays');
const ScheduledCustomerService = require('../modules/scheduledCustomers');

beforeAll(async () => {
    await db.connect()
    process.env.JWT_TOKEN = 'token';
});
beforeEach(async () => await db.clear());
afterAll(async () => await db.close()); 

describe('All User Actions', () => {
    test('Create user, a schedule, and populate it', async () => {
        const user = await getMockUser();
        const date = new Date();

        const schedule = await ScheduleService.createSchedule({ startDay: date, userID: user._id });
        const scheduleDay = await ScheduleDayService.createScheduleDay({ dayOffset: 0, scheduleID: schedule._id });

        let rawArgs = {
            scheduledCustomerInput: {
                customerId: "customerId",
                serviceStartTime: new Date("2023-01-01 12:00"),
                serviceEndTime: new Date("2023-01-01 13:00"),
                scheduleDay: scheduleDay._id
            }
        };

        const scheduledCustomer = await ScheduledCustomerService.createScheduledCustomer(rawArgs);

        rawArgs.scheduledCustomerInput.customerId = "customerId2";
        await ScheduledCustomerService.createScheduledCustomer(rawArgs);

        const userDeleted = await UserService.deleteUser({ userID: user._id });
        expect(userDeleted).toBe(true);

        const schedules = await ScheduleService.getSchedules({ userID: user._id });
        expect(schedules.length).toBe(0);

        const scheduleDays = await ScheduleDayService.getScheduleDays({ scheduleID: schedule._id });
        expect(scheduleDays.length).toBe(0);

        const scheduledCustomers = await ScheduledCustomerService.getScheduledCustomers({ scheduleDayID: scheduleDay._id });
        expect(scheduledCustomers.length).toBe(0);
    });
});