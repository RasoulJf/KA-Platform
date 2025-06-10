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
import exelRouter from "./Routes/Exel.js";
import dashboardRouter from "./Routes/dashboard.js";
import studentDashboardRouter from "./Routes/studentDashboard.js";
import myActivitiesRouter from "./Routes/myActivities.js";
import adminReviewRouter from "./Routes/adminReview.js";

const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("Public")); 


app.use("/api/auth",authRouter)
app.use("/api/update-status",updateStatusRouter)
app.use("/api/activity",activityRouter)
app.use("/api/reward",rewardRouter)
app.use("/api/student-activity",studentActivityRouter)
app.use("/api/admin-activity",adminActivityRouter)
app.use("/api/student-reward",studentRewardRouter)
app.use("/api/users",userRouter)
app.use("/api/exel",exelRouter)
app.use('/api/dashboard', dashboardRouter);
app.use('/api/student-dashboard', studentDashboardRouter); // <--- روت جدید داشبورد دانش‌آموز را با یک پیشوند مناسب استفاده کنید
app.use('/api/my-activities', myActivitiesRouter); // استفاده از روت با پیشوند
app.use('/api/admin-review', adminReviewRouter); // <<--- پیشوند روت





app.use("*", (req, res, next) => { 
  next(new HandleERROR("Route not Found", 404));
});
app.use(catchError); 

export default app;
