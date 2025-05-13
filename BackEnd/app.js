import express from "express";
import { fileURLToPath } from "url";
import catchError from "./Utils/catchError.js";
import HandleERROR from "./Utils/handleError.js";
import path from "path";
import cors from "cors";
import authRouter from "./Routes/Auth.js";
import activityRouter from "./Routes/Activity.js";
import rewardRouter from "./Routes/Reward.js";
import studentActivityRouter from "./Routes/StudentActivity.js";
import studentRewardRouter from "./Routes/StudentReward.js";
import updateStatusRouter from "./Routes/UpdateStatus.js";
import adminActivityRouter from "./Routes/AdminActivity.js";
import userRouter from "./Routes/User.js";

const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("Public")); 


app.use("/api/auth",authRouter)
app.use("/api/updateStatus",updateStatusRouter)
app.use("/api/activity",activityRouter)
app.use("/api/reward",rewardRouter)
app.use("/api/studentActivity",studentActivityRouter)
app.use("/api/adminActivity",adminActivityRouter)
app.use("/api/studentReward",studentRewardRouter)
app.use("/api/upload-users",userRouter)


app.use("*", (req, res, next) => { 
  next(new HandleERROR("Route not Found", 404));
});
app.use(catchError); 

export default app;
