// routes/adminReviewRouter.js
import express from 'express';
import { approveStudentActivity, getAllStudentActivitiesForReview, getStudentActivityStatsForAdmin, rejectStudentActivity } from '../Controllers/adminReviewCn.js';


const adminReviewRouter = express.Router();

// اعمال میدل‌ورها برای تمام روت‌های این فایل

adminReviewRouter.get('/student-activity-stats', getStudentActivityStatsForAdmin);
adminReviewRouter.get('/student-activities-list', getAllStudentActivitiesForReview);
adminReviewRouter.patch('/student-activities/:studentActivityId/approve', approveStudentActivity);
adminReviewRouter.patch('/student-activities/:studentActivityId/reject', rejectStudentActivity);

export default adminReviewRouter;