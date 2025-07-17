import express from "express";
import { fileURLToPath } from "url";
import catchError from "./Utils/catchError.js";
import HandleERROR from "./Utils/handleError.js";
import path from "path";
import cors from "cors"; // این ایمپورت درسته

// ... بقیه ایمپورت‌های روت‌ها
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
import reportRouter from "./Routes/Report.js";
import notifRouter from "./Routes/Notification.js";


const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

const app = express();


// ✅ FIX 1: تنظیمات کامل CORS رو اینجا تعریف می‌کنیم
const corsOptions = {
  // آدرس دقیق فرانت‌اند شما. اگر روی پورت دیگه‌ای اجرا می‌شه، تغییرش بده.
  // پورت پیش‌فرض Vite معمولاً 5173 است.
  methods: "GET,POST,PUT,DELETE,PATCH,HEAD",
  // هدرهایی که فرانت اجازه داره ارسال کنه رو مشخص می‌کنیم
  allowedHeaders: "Content-Type,Authorization",
  credentials: true,
};

// ✅ FIX 2: از تنظیمات بالا در میدل‌ور cors استفاده می‌کنیم
app.use(cors(corsOptions));

// ✅ FIX 3: این خط مهم برای پاسخ به درخواست‌های preflight (OPTIONS) هست
app.options('*', cors(corsOptions));


app.use(express.json());
app.use(express.static("Public")); 


// حالا روت‌ها رو مثل قبل تعریف می‌کنیم
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
app.use('/api/student-dashboard', studentDashboardRouter);
app.use('/api/my-activities', myActivitiesRouter);
app.use('/api/admin-review', adminReviewRouter);
app.use('/api/reports', reportRouter);
app.use('/api/notifications', notifRouter);


app.use("*", (req, res, next) => { 
  next(new HandleERROR("Route not Found", 404));
});
app.use(catchError); 

export default app;