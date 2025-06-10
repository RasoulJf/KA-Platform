import mongoose from "mongoose";

const adminActivitySchema = new mongoose.Schema(
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
      required: [true, "Details is required"], 
      trim: true, 
      default: undefined
    },
    scoreAwarded: {
      type: Number,      
      default: 0,   
    },
    type:{
      type:String,
      enum:["گروهی","فردی"]
    },
    description:{
      type:String
    }
  },
  { timestamps: true, versionKey: false }
);

const AdminActivity = mongoose.model(
  "AdminActivity",
  adminActivitySchema
);

export default AdminActivity;