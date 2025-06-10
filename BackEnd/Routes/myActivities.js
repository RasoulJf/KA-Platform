// myActivitiesRouter.js (مثال)
import express from 'express';
import isLogin from '../Middlewares/isLogin.js';
import { getMyActivitiesList, getMyActivityStats } from '../Controllers/StudentActivityCn.js';

const myActivitiesRouter = express.Router();

// اندپوینت برای آمار کارت ها
myActivitiesRouter.get('/my-stats', isLogin, getMyActivityStats);

// اندپوینت برای لیست فعالیت ها با فیلتر و صفحه بندی
// GET /api/my-activities/list?status=pending&sortBy=submissionDate&order=desc&page=1&limit=10
myActivitiesRouter.get('/my-list', isLogin, getMyActivitiesList);

export default myActivitiesRouter