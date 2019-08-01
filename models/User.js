import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
  },

  name: {
    type: String,
    required: [true, 'Please enter user name..'],
  },

  email: {
    type: String,
    unique: true,
    required: [true, 'Please enter email id..'],
  },

  password: {
    type: String,
    required: [true, 'Please enter password..'],
  },

  items: [
    {
      item: {
        type: Schema.Types.ObjectId,
        ref: 'Items',
      },
    },
  ],

  date: {
    type: Date,
    default: Date.now,
  },
});

export default model('Users', userSchema);
