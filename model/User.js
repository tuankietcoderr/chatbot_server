const mongoose = require("mongoose");
const SCHEMA = require("./schema-name");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  fullName: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  is_email_verified: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model(SCHEMA.USERS, UserSchema);
