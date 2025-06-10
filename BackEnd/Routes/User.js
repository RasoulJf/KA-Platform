import express from 'express';
import { findStudentByDetails, getAllStudentsForSelection, getGradeRankingTable, getOverallRankingTable, getSameGradeRankingTable, getStudentsByGradeAndClass, getTopStudentsByAllGrades, getUserSummaryStats } from '../Controllers/UserCn.js';
import upload from '../Utils/uploadFile.js';
import isLogin from '../Middlewares/isLogin.js';
import isAdmin from '../Middlewares/isAdmin.js';

const userRouter = express.Router();

// In your route handler
userRouter.route("/summary-stats").get(getUserSummaryStats)
userRouter.route("/students-selection").get(getAllStudentsForSelection);
userRouter.get('/find-by-details', findStudentByDetails);
userRouter.get('/top-students-by-all-grades', getTopStudentsByAllGrades); // روت جدید
userRouter.get('/by-grade-class', getStudentsByGradeAndClass); // <--- روت جدید
userRouter.get('/overall-table', getOverallRankingTable);
userRouter.get('/my-grade-rankings', isLogin, getSameGradeRankingTable);
userRouter.get('/grade-rankings', isAdmin, getGradeRankingTable); // میدل‌ور isAdmin اگر فقط ادمین باید دسترسی داشته باشه






export default userRouter;