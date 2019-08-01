import mongoose from 'mongoose';

const mongoURI = 'mongodb://localhost:27017/cms_2k19';

export default async () => {
  try {
    const isConnected = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });

    if (isConnected) console.log('conecting to mongodb...');
  } catch (error) {
    process.exit();
    throw error.message;
  }
};
