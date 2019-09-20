const { Schema, model } = require('mongoose');

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Please enter user name..']
  },

  email: {
    type: String,
    unique: true,
    required: [true, 'Please enter email id..']
  },

  password: {
    type: String,
    required: [true, 'Please enter password..']
  },

  items: [
    {
      item: {
        type: Schema.Types.ObjectId,
        ref: 'Items'
      }
    }
  ],

  profile: {
    type: Schema.Types.ObjectId,
    ref: 'Profiles'
  },

  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = model('Users', userSchema);
