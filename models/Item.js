import { Schema, model } from 'mongoose';

const itemSchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
  },

  users: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'Users',
      },
    },
  ],

  name: {
    type: String,
    required: [true, 'Please enter item name..'],
  },

  price: {
    type: String,
    required: [true, 'Please enter price..'],
  },

  likes: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'Users',
      },
    },
  ],

  unlikes: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'Users',
      },
    },
  ],

  provider: {
    type: String,
    required: [true, 'Please enter provider..'],
  },

  date: {
    type: Date,
    default: Date.now,
  },
});

export default model('Items', itemSchema);