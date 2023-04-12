const Schedule = require('../models/schedule');

module.exports = {
    getSchedules: async rawArgs => {
        let userID = rawArgs.userID;
        return Schedule.find({ user: userID })
        .then(schedules => {
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
        const newStartDay = rawArgs.startDay;
        const scheduleID = rawArgs.scheduleID;

        return Schedule.findById(scheduleID).then(async schedule => {
            if (!schedule) {
                throw new Error("Cannot find schedule.");
            }

            const userID = schedule.user;

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

            // grab all scheduleDays associated with schedule._id and delete them
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