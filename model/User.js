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
  },
});

module.exports = mongoose.model(SCHEMA.USERS, UserSchema);
