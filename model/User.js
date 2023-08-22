const mongoose = require("mongoose");
const SCHEMA = require("./schema-name");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
  },
  password: {
    type: String,
  },
  fullName: {
    type: String,
  },
});

module.exports = mongoose.model(SCHEMA.USERS, UserSchema);
