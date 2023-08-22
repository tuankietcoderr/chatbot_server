const mongoose = require("mongoose");

const connectDB = async () => {
  const isProduction = process.env.NODE_ENV === "production";
  try {
    await mongoose.connect(
      isProduction ? process.env.MONGODB_URI_PROD : process.env.MONGODB_URI_DEV,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log("MongoDB Connected...");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
