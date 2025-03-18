import mongoose from "mongoose";

const rewardSchema = new mongoose.Schema({
  parent: {
    type: String,
    enum: ["پاداش های عمومی", "پاداش های اختصاصی", "پاداش نیکوکارانه"],
    required: true, 
  },
  name: {
    type: String, 
    required: [true, "Activity name is required"], 
  },
  description: {
    type: String,
  },
  minToken: {
    type: Number,
  },
  maxToken: {
    type: Number,
  }
});

const Reward = mongoose.model("Reward", rewardSchema);

export default Reward;
