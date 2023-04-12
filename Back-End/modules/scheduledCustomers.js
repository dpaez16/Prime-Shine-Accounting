const ScheduledCustomer = require('../models/scheduledCustomer');

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
    createScheduledCustomers: async rawArgs => {
        const args = rawArgs.scheduledCustomerInput;
        return ScheduledCustomer.find(args)
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
    }
}