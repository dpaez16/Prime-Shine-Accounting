const { expect, test } = require('@jest/globals');
const { getMockUser } = require('./testUtils');
const ScheduleService = require('../modules/schedules');
const ScheduleDayService = require('../modules/scheduleDays');
const ScheduledCustomerService = require('../modules/scheduledCustomers');
const db = require('./dbUtil');

beforeAll(async () => {
    await db.connect()
    process.env.JWT_TOKEN = 'token';
});
beforeEach(async () => await db.clear());
afterAll(async () => await db.close()); 

describe('ScheduledCustomers Schema', () => {
    test('createScheduledCustomer', async () => {
        const user = await getMockUser();
        const date = new Date();
        
        const schedule = await ScheduleService.createSchedule({ startDay: date, userID: user._id });
        const scheduleDay = await ScheduleDayService.createScheduleDay({ dayOffset: 0, scheduleID: schedule._id });

        let rawArgs = {
            scheduledCustomerInput: {
                customerId: "customerId",
                serviceStartTime: new Date("2023-01-01 12:00"),
                serviceEndTime: new Date("2023-01-01 13:00"),
                scheduleDay: user._id
            }
        };
        
        // trying to create scheduled customer for non-existing schedule day
        await expect(ScheduledCustomerService.createScheduledCustomer(rawArgs)).rejects.toThrow(Error);

        // successfully creating a scheduled customer
        rawArgs.scheduledCustomerInput.scheduleDay = scheduleDay._id;
        const scheduledCustomer = await ScheduledCustomerService.createScheduledCustomer(rawArgs);
        expect(scheduledCustomer).toBeTruthy();
        expect(scheduledCustomer).toHaveProperty('customerId', rawArgs.scheduledCustomerInput.customerId);
        expect(scheduledCustomer).toHaveProperty('serviceStartTime', rawArgs.scheduledCustomerInput.serviceStartTime);
        expect(scheduledCustomer).toHaveProperty('serviceEndTime', rawArgs.scheduledCustomerInput.serviceEndTime);
        expect(scheduledCustomer).toHaveProperty('scheduleDay', rawArgs.scheduledCustomerInput.scheduleDay);

        // trying to create duplicate scheduled customer
        await expect(ScheduledCustomerService.createScheduledCustomer(rawArgs)).rejects.toThrow(Error);
    });

    test('getScheduledCustomers', async () => {
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

        let rawArgs2 = {
            scheduledCustomerInput: {
                customerId: "customerId2",
                serviceStartTime: new Date("2023-01-01 13:00"),
                serviceEndTime: new Date("2023-01-01 14:00"),
                scheduleDay: scheduleDay._id
            }
        };

        const scheduledCustomer2 = await ScheduledCustomerService.createScheduledCustomer(rawArgs2);

        const scheduledCustomers = await ScheduledCustomerService.getScheduledCustomers({ scheduleDayID: scheduleDay._id });
        expect(scheduledCustomers).toBeTruthy();
        expect(scheduledCustomers.length).toBe(2);
    });
    
    test("editScheduledCustomer", async () => {
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

        let rawArgs2 = {
            scheduledCustomerInput: {
                customerId: "customerId2",
                serviceStartTime: new Date("2023-01-01 12:00"),
                serviceEndTime: new Date("2023-01-01 13:00"),
                scheduleDay: scheduleDay._id
            }
        };
        
        const scheduledCustomer2 = await ScheduledCustomerService.createScheduledCustomer(rawArgs2);

        // successfully edit scheduled customer
        const scheduledCustomerEdited = await ScheduledCustomerService.editScheduledCustomer({
            scheduledCustomerInput: { ...rawArgs.scheduledCustomerInput, ...{ customerId: `${scheduledCustomer2.customerId}2` } },
            scheduledCustomerID: scheduledCustomer._id
        });

        expect(scheduledCustomerEdited).toBeTruthy();
        expect(scheduledCustomerEdited).toHaveProperty('customerId', `${scheduledCustomer2.customerId}2`);
        expect(scheduledCustomerEdited).toHaveProperty('serviceStartTime', rawArgs.scheduledCustomerInput.serviceStartTime);
        expect(scheduledCustomerEdited).toHaveProperty('serviceEndTime', rawArgs.scheduledCustomerInput.serviceEndTime);
        expect(scheduledCustomerEdited).toHaveProperty('scheduleDay', rawArgs.scheduledCustomerInput.scheduleDay);

        // trying to edit a scheduled customer but fails due to duplication
        await expect(ScheduledCustomerService.editScheduledCustomer({
            scheduledCustomerInput: { ...rawArgs.scheduledCustomerInput, ...{ customerId: scheduledCustomer2.customerId } },
            scheduledCustomerID: scheduledCustomer._id
        })).rejects.toThrow(Error);

        // trying to edit a scheduled customer that does not exist
        await expect(ScheduledCustomerService.editScheduledCustomer({
            scheduledCustomerInput: { ...rawArgs.scheduledCustomerInput, ...{ customerId: scheduledCustomer.customerId } },
            scheduledCustomerID: user._id
        })).rejects.toThrow(Error);
    });

    test("deleteScheduledCustomer", async () => {
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

        // try to delete scheduled customer that does not exist
        await expect(ScheduledCustomerService.deleteScheduledCustomer({ scheduledCustomerID: user._id })).rejects.toThrow(Error);

        // successfully deleting scheduled customer
        const deletedScheduledCustomer = await ScheduledCustomerService.deleteScheduledCustomer({ scheduledCustomerID: scheduledCustomer._id });
        expect(deletedScheduledCustomer).toBe(true);
    });
});