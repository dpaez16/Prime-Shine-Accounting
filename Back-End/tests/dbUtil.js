const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const opts = {
  useNewUrlParser: true,
  useUnifiedTopology: true
};

const connect = async () => {
    await mongoose.disconnect();

    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    await mongoose.connect(mongoUri, opts)
        .catch(err => {
            if (err) {
                throw err;
            }
        });
};

const close = async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
};

const clear = async () => {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
        await collections[key].deleteMany();
    }

    await mongoose.connection.db.dropDatabase();
};

module.exports = {
    connect,
    close,
    clear
};