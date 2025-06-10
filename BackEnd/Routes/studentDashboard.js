// userRouter.js یا studentDashboardRouter.js
import express from 'express';
import { getStudentDashboardData } from '../Controllers/studentDashboardCn.js';
import isLogin from '../Middlewares/isLogin.js';

const studentDashboardRouter = express.Router();

studentDashboardRouter.get('/',isLogin, getStudentDashboardData); // اندپوینت مثلا /api/users/dashboard

export default studentDashboardRouter;