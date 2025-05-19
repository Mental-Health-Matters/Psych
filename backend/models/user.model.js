const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: {
      validator: function(value) {
        return value.endsWith('@iiita.ac.in');
      },
      message: 'Email must be from the @iiita.ac.in domain',
    },
  },
  firstName: {
    type: String,
    required: [true, 'FirstName is required'],
  },
  lastName: {
    type: String,
    required: [true, 'LastName is required'],
  },
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: [validator.isLowercase, 'Username must be in lowercase'],
    minlength: [3, 'Minimum Username length is 3 characters'],
    maxlength: [20, 'Maximum Username length is 20 characters'],
  },
  password: {
    type: String,
    required: function() { return this.authProvider !== 'google'; },  // Only required if the authProvider is not Google
    minlength: [6, 'Minimum password length is 6 characters'],
  },
  profilePicture: {
    type: String,
    default: '',
  },
  authProvider: {
    type: String,
    enum: ['google', 'local'],
    required: [true, 'Authentication provider is required'],
  },
  otp: String,
  otpExpiresAt: Date,
}, {timestamps: true});

const User = mongoose.model('User', userSchema);
module.exports = User;
