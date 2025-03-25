import mongoose from "mongoose";

const studentAvreageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    avreage: {
      type: Number,
    },
    scoreAwarded: {
      type: Number,
      default: 0,
    },
    activityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Activity",
      required: true,
      index: true,
    },
  },
  { timestamps: true, versionKey: false }
);

const StudentAvreage = mongoose.model("StudentAvreage", studentAvreageSchema);

export default StudentAvreage;
