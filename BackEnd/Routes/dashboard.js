import express from 'express';
import { getDashboardSummary, getRecentPendingRequests } from '../Controllers/dashboardCn.js';
import isAdmin from '../Middlewares/isAdmin.js';

const dashboardRouter = express.Router();

// router.use(protect); // اعمال احراز هویت برای همه روت‌های داشبورد
// router.use(restrictTo('admin', 'superAdmin')); // محدود کردن دسترسی به ادمین‌ها
dashboardRouter.use(isAdmin);

dashboardRouter.get('/summary', getDashboardSummary);
dashboardRouter.get('/recent-pending-requests', getRecentPendingRequests);



export default dashboardRouter;