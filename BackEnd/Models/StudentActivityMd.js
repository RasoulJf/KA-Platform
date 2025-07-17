import mongoose from "mongoose";

const studentActivitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,  
    },
    activityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Activity",
      required: true,
      index: true, 
    },
    details: {
      type: String,
      // required: [true, "Details is required"], 
      trim: true, 
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    scoreAwarded: {
      type: Number,      
      default: 0,   
    },
    adminComment: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true, versionKey: false }
);

const StudentActivity = mongoose.model(
  "StudentActivity",
  studentActivitySchema
);

export default StudentActivity;
