const mongoose = require("mongoose");
const SCHEMA = require("./schema-name");

const ChatSchema = new mongoose.Schema(
  {
    answer: {
      type: String,
    },
    question: {
      type: String,
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
      type: [Object],
      default: [
        {
          title: "",
          link: "",
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(SCHEMA.CHATS, ChatSchema);
