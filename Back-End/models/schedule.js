const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const scheduleSchema = new Schema({
    startDay: {
        type: Date,
        required: true
    },
    days: [
        type: Schema.Types.ObjectId,
        ref: 'ScheduleDay'
    ],
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model('Schedule', scheduleSchema);