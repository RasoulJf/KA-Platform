import mongoose from "mongoose";

const rewardSchema = new mongoose.Schema({
  parent: {
    type: String,
    enum: ["پاداش‌های عمومی", "پاداش‌های اختصاصی", "پاداش نیکوکارانه"],
  },
  name: {
    type: String, 
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
