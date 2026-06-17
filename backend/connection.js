require("dotenv").config();
const mongoose = require("mongoose");
const url = process.env.MONGODB_URL;

const mongodb = async () => {
  mongoose
    .connect(url)
    .then(() => {
      console.log("MongoDB connected...");
    })
    .catch((err) => {
      console.log("MongoDB connection error:", err);
    });
};

module.exports = mongodb;
