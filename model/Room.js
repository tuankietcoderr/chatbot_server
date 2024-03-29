const mongoose = require("mongoose");
const SCHEMA = require("./schema-name");
const Chat = require("./Chat");

const RoomSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  shortDescription: {
    type: String,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: SCHEMA.USERS,
  },
  index: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model(SCHEMA.ROOMS, RoomSchema);
