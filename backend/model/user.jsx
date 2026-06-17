const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: false,
      unique: true,
      trim: true,
    },
    phone: {
      type: String,
      required: false,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      minlength: 6,
      required: true,
    },
    name: {
      type: String,
      trim: true,
    },
    otp: String,
    otpExpiry: Date,
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
