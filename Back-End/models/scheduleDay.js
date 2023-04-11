const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const scheduleDaySchema = new Schema({
    dayOffset: {
        type: Schema.Types.Number,
        required: true
    },
    schedule: {
        type: Schema.Types.ObjectId,
        ref: 'Schedule'
    }
});

module.exports = mongoose.model('ScheduleDay', scheduleDaySchema);