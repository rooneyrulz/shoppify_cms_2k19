import { Schema, model } from 'mongoose';

const profileSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'Users',
  },

  company: {
    type: String,
    required: [true, 'company is required!'],
  },

  website: {
    type: String,
  },

  location: {
    type: String,
    required: [true, 'location must be provided!'],
  },

  status: {
    type: String,
    required: [true, 'status is required!'],
  },

  skills: {
    type: [String],
    required: [true, 'leave at least one skill!'],
  },

  bio: {
    type: String,
    required: [true, 'bio is required!'],
  },

  social: {
    youtube: {
      type: String,
    },

    twitter: {
      type: String,
    },

    facebook: {
      type: String,
    },

    linkedin: {
      type: String,
    },

    instagram: {
      type: String,
    },
  },

  avatar: {
    type: String,
    required: [true, 'please provide your avatar!'],
  },

  date: {
    type: Date,
    default: Date.now,
  },
});

export default model('Profiles', profileSchema);
