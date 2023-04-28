const ScheduledCustomer = require('../models/scheduledCustomer');
const ScheduleDay = require('../models/scheduleDay');

module.exports = {
    getScheduledCustomers: async rawArgs => {
        const { scheduleDayID } = rawArgs;
        return ScheduledCustomer.find({ scheduleDay: scheduleDayID })
        .then(scheduledCustomers => {
            return scheduledCustomers;
        }).catch(err => {
            throw err;
        });
    },
    createScheduledCustomer: async rawArgs => {
        const args = rawArgs.scheduledCustomerInput;

        return ScheduleDay.findById(args.scheduleDay)
        .then(scheduleDay => {
            if (!scheduleDay) {
                throw new Error("Schedule Day does not exist.");
            }

            return ScheduledCustomer.findOne(args);
        })
        .then(scheduledCustomer => {
            if (scheduledCustomer) {
                throw new Error("Scheduled Customer already exists.");
            }

            const newScheduledCustomer = new ScheduledCustomer(args);
            return newScheduledCustomer.save();
        })
        .then(result => {
            return { ...result._doc };
        })
        .catch(err => {
            throw err;
        });
    },
    editScheduledCustomer: async rawArgs => {
        const {scheduledCustomerInput, scheduledCustomerID} = rawArgs;

        return ScheduledCustomer.findById(scheduledCustomerID)
        .then(scheduledCustomer => {
            if (!scheduledCustomer) {
                throw new Error("Scheduled customer does not exist.");
            }

            return ScheduledCustomer.findOne(scheduledCustomerInput);
        })
        .then(foundScheduledCustomer => {
            if (foundScheduledCustomer) {
                throw new Error("Scheduled customer already exists.");
            }

            return ScheduledCustomer.findById(scheduledCustomerID);
        })
        .then(scheduledCustomer => {
            scheduledCustomer.customerId = scheduledCustomerInput.customerId;
            scheduledCustomer.serviceStartTime = scheduledCustomerInput.serviceStartTime;
            scheduledCustomer.serviceEndTime = scheduledCustomerInput.serviceEndTime;

            return scheduledCustomer.save();
        })
        .then(result => {
            return { ...result._doc };
        })
        .catch(err => {
            throw err;
        });
    },
    deleteScheduledCustomer: async rawArgs => {
        const { scheduledCustomerID } = rawArgs;

        return ScheduledCustomer.findById(scheduledCustomerID)
        .then(scheduledCustomer => {
            if (!scheduledCustomer) {
                throw new Error("Scheduled customer does not exist.");
            }

            return ScheduledCustomer.deleteOne({ _id: scheduledCustomerID });
        })
        .then(result => {
            return true;
        })
        .catch(err => {
            throw err;
        });
    }
}