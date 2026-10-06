const mongoose = require("mongoose");

const visitorSchema = new mongoose.Schema(
  {
    visitorName: {
      type: String,
      required: [true, "Visitor name is required"],
      trim: true,
      minlength: [2, "Visitor name must contain at least 2 characters"],
      maxlength: [100, "Visitor name is too long"]
    },
    mobileNumber: {
      type: String,
      required: [true, "Mobile number is required"],
      trim: true,
      match: [/^[0-9]{10}$/, "Mobile number must contain exactly 10 digits"]
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email address"]
    },
    organization: {
      type: String,
      required: [true, "Organization/College name is required"],
      trim: true,
      maxlength: [150, "Organization name is too long"]
    },
    personToMeet: {
      type: String,
      required: [true, "Person to meet is required"],
      trim: true,
      maxlength: [100, "Person to meet is too long"]
    },
    purpose: {
      type: String,
      required: [true, "Purpose of visit is required"],
      trim: true,
      maxlength: [300, "Purpose is too long"]
    },
    visitDateTime: {
      type: Date,
      required: [true, "Date and time of visit is required"]
    },
    status: {
      type: String,
      enum: ["Checked In", "Checked Out"],
      default: "Checked In"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Visitor", visitorSchema);
