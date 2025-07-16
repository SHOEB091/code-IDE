const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    default: '',
  },
  username: {
    type: String,
    default: '',
    sparse: true, // Allows multiple null/empty values but enforces uniqueness on actual values
  },
  occupation: {
    type: String,
    default: '',
  },
  profileImage: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    default: '',
  },
  date: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('User', userSchema);