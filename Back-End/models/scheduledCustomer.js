const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const scheduledCustomerSchema = new Schema({
    customerId: {
        type: String,
        required: true
    },
    serviceStartTime: {
        type: Date,
        required: true
    },
    serviceEndTime: {
        type: Date,
        required: true
    },
    scheduleDay: {
        type: Schema.Types.ObjectId,
        ref: 'ScheduleDay'
    }
});

module.exports = mongoose.model('ScheduledCustomer', scheduledCustomerSchema);