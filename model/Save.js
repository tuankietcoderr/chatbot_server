const mongoose = require("mongoose");
const SCHEMA = require("./schema-name");

const SaveSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: SCHEMA.USERS,
    },
    chat: {
      type: mongoose.Types.ObjectId,
      ref: SCHEMA.CHATS,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(SCHEMA.SAVES, SaveSchema);
