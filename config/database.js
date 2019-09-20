const mongoose = require('mongoose');
const config = require('config');

const init = async () => {
  try {
    const isConnected = await mongoose.connect(config.get('MONGO_URI'), {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      server: {
        // sets how many times to try reconnecting
        reconnectTries: 3,
        // sets the delay between every retry (milliseconds)
        reconnectInterval: 1000
      }
    });

    if (isConnected) console.log('conecting to mongodb...');
  } catch (error) {
    process.exit(1);
    throw error.message;
  }
};

module.exports = init;
