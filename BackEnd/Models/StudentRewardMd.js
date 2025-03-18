import mongoose from "mongoose";

const studentRewardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    rewardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reward",
      required: true,
      index: true,
    },
    token: {
      type: Number,
      required: [true, "Token is required"],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true, versionKey: false }
);

const StudentReward = mongoose.model("StudentReward", studentRewardSchema);

export default StudentReward;
