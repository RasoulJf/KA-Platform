import express from 'express';
import isAdmin from '../Middlewares/isAdmin.js'; // میدلور ادمین شما
import isLogin from '../Middlewares/isLogin.js';
import { createStudentActivitiesReport, generateGeneralReport, getStudentActivityParents } from '../Controllers/reportCn.js';

const reportRouter = express.Router();

// این روت باید توسط ادمین قابل دسترسی باشه
reportRouter.post('/student-activities', isLogin, isAdmin, createStudentActivitiesReport);
reportRouter.get('/activity-parents/:studentId', isLogin, getStudentActivityParents);
reportRouter.post('/generate-report', isLogin, isAdmin, generateGeneralReport);



export default reportRouter;