const mongoose = require("mongoose");
const SCHEMA = require("./schema-name");

const ChatSchema = new mongoose.Schema(
  {
    isBotChat: {
      type: Boolean,
      default: false,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: SCHEMA.ROOMS,
    },

    isSaved: {
      type: Boolean,
      default: false,
    },

    reference: {
      type: Object,
      default: {
        title: "",
        link: "",
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(SCHEMA.CHATS, ChatSchema);
