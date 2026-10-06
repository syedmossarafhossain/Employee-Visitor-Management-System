const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email address"]
    },
    password: {
      type: String,
      select: false
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true
    },
    avatar: {
      type: String,
      default: ""
    },
    role: {
      type: String,
      enum: ["admin", "employee"],
      default: "employee"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
