const mongoose = require('mongoose');
const DB_URL =  `mongodb+srv://${process.env.MONGO_USER}:` + 
                `${process.env.MONGO_PASSWORD}@` + 
                `${process.env.MONGO_CLUSTER_DOMAIN}/` + 
                `${process.env.MONGO_DB}?retryWrites=true&w=majority`;

function dbConnect() {
    return mongoose.connect(DB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
}

module.exports = { dbConnect };