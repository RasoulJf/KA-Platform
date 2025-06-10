import express from 'express';
import { getDashboardSummary } from '../Controllers/dashboardCn.js';

const dashboardRouter = express.Router();

// router.use(protect); // اعمال احراز هویت برای همه روت‌های داشبورد
// router.use(restrictTo('admin', 'superAdmin')); // محدود کردن دسترسی به ادمین‌ها

dashboardRouter.get('/summary', getDashboardSummary);


export default dashboardRouter;