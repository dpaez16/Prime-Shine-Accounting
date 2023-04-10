const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const scheduleDaySchema = new Schema({
    dayOffset: {
        type: Schema.Types.Number,
        required: true
    },
    customers: [
        {
            type: Schema.Types.ObjectId,
            ref: 'ScheduledCustomer'
        }
    ],
    schedule: {
        type: Schema.Types.ObjectId,
        ref: 'Schedule'
    }
});

module.exports = mongoose.model('ScheduleDay', scheduleDaySchema);