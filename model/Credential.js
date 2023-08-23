const mongoose = require("mongoose");
const SCHEMA = require("./schema-name");

const CredentialSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: SCHEMA.USERS,
  },
  password: {
    type: String,
  },
});

module.exports = mongoose.model(SCHEMA.CREDENTIALS, CredentialSchema);
