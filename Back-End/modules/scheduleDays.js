const Schedule = require('../models/schedule');
const ScheduleDay = require('../models/scheduleDay');
const { getScheduledCustomers, deleteScheduledCustomer } = require('../modules/scheduledCustomers');


module.exports = {
    getScheduleDays: async rawArgs => {
        const { scheduleID } = rawArgs;
        return ScheduleDay.find({
            schedule: scheduleID
        }).then(scheduleDays => {
            return scheduleDays;    
        }).catch(err => {
            throw err;
        });
    },
    createScheduleDay: async rawArgs => {
        const { dayOffset, scheduleID } = rawArgs;
        let newScheduleDay = new ScheduleDay({
            dayOffset: dayOffset,
            schedule: scheduleID
        });

        return Schedule.findById(scheduleID)
        .then(schedule => {
            if (!schedule) {
                throw new Error('Schedule does not exist.');
            }

            return ScheduleDay.find({ schedule: scheduleID });
        }).then(scheduleDays => {
            const filteredDays = scheduleDays.filter(day => day.dayOffset == dayOffset);

            if (filteredDays.length > 0) {
                throw new Error('Day already exists.');
            }

            return newScheduleDay.save();
        }).then(result => {
            return { ...result._doc };
        }).catch(err => {
            throw err;
        });
    },
    deleteScheduleDay: async rawArgs => {
        const { dayOffset, scheduleID } = rawArgs;

        return ScheduleDay.findOne({ dayOffset: dayOffset, schedule: scheduleID }).then(scheduleDay => {
            if (!scheduleDay) {
                throw new Error("Schedule day does not exist.");
            }

            return getScheduledCustomers({ scheduleDayID: scheduleDay._id });
        })
        .then(scheduledCustomers => {
            let deletedResults = scheduledCustomers.map(async scheduledCustomer => await deleteScheduledCustomer({ scheduledCustomerID: scheduledCustomer._id }));
            return Promise.all(deletedResults);
        })
        .then(res => {
            return ScheduleDay.deleteOne({ dayOffset: dayOffset, schedule: scheduleID });
        })
        .then(_ => {
            return true;
        }).catch(err => {
            throw err;
        });
    }
}