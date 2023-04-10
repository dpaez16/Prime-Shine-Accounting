const Schedule = require('../models/schedule');

module.exports = {
    getSchedules: async rawArgs => {
        let userID = rawArgs.userID;
        return Schedule.find({ user: userID })
        .then(schedules => {
            console.log(schedules);
            return schedules;
        })
        .catch((err) => {
            throw err;
        });
    },
    createSchedule: async rawArgs => {
        let { startDay, userID } = rawArgs;
        
        return Schedule.findOne({
            startDay: startDay,
            user: userID
        }).then(schedule => {
            if (schedule) {
                throw new Error('Schedule exists already.');
            }

            let newSchedule = new Schedule({
                startDay: startDay,
                days: [],
                user: userID
            });

            return newSchedule.save();
        }).then(result => {
            return { ...result._doc };
        }).catch(err => {
            throw err;
        });
    },
    editSchedule: async rawArgs => {
        let newStartDay = rawArgs.startDay;
        let scheduleID = rawArgs.scheduleID;

        return Schedule.findById(rawArgs.scheduleID).then(async schedule => {
            if (!schedule) {
                throw new Error("Cannot find schedule.");
            }

            let userID = schedule.userID;

            return Schedule.findOne({
                startDay: newStartDay,
                user: userID
            }).then(foundSchedule => {
                if (foundSchedule) {
                    throw new Error('Schedule exists already.');
                }
                
                schedule.startDay = newStartDay;
                return schedule.save();
            })
            .then(result => {
                return { ...result._doc };
            });
        })
        .catch(err => {
            throw err;
        });
    },
    deleteSchedule: async rawArgs => {
        let { startDay, userID } = rawArgs;

        return Schedule.findOne({
            startDay: startDay,
            user: userID
        }).then(async schedule => {
            if (!schedule) {
                throw new Error("Schedule not found.");
            }

            // delete scheduleDays -> delete scheduledCustomers
            return Promise.all([])
            .then(async _ => {
                return Schedule.deleteOne({ 
                    startDay: startDay, 
                    user: userID 
                });
            })
            .then(result => {
                return true;
            });
        })
        .catch((err) => {
            throw err;
        });
    }
}