const mongoose = require("mongoose");
const SCHEMA = require("./schema-name");

const SaveSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: SCHEMA.USERS,
    },
    roomId: {
      type: mongoose.Types.ObjectId,
      ref: SCHEMA.ROOMS,
    },
    content: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(SCHEMA.SAVES, SaveSchema);
