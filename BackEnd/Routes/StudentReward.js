// studentRewardRoutes.js
import express from 'express';
import {
    createStudentReward,
    getOneStudentReward,
    changeStatusRe,
    getMyRewardStats,
    getMyStudentRewards,
    getAllStudentRewardsForAdmin, // <<<< کنترلر جدید برای ادمین
    getAdminRewardStats,          // <<<< کنترلر جدید برای آمار ادمین
    getMyRewardsListPaginated,
    getStudentRewardsForAdminList
} from '../Controllers/StudentRewardCn.js';

import isLogin from '../Middlewares/isLogin.js';
import isAdmin from '../Middlewares/isAdmin.js';

const studentRewardRouter = express.Router();

studentRewardRouter.use(isLogin); // میدل‌ور احراز هویت برای همه روت‌های زیر

// روت‌های مربوط به کاربر لاگین شده (دانش‌آموز)
studentRewardRouter.route('/')
    .post(createStudentReward)
    .get(getMyStudentRewards);

studentRewardRouter.get('/rewards-list', isAdmin, getStudentRewardsForAdminList); // <<< روت جدید ما برای ادمین


// روت‌های ادمین باید قبل از روت‌های با پارامتر داینامیک مثل /:id تعریف شوند
studentRewardRouter.route('/admin-stats')     // <<<< این روت باید قبل از /:id بیاد
    .get(isAdmin, getAdminRewardStats);

studentRewardRouter.route('/all-for-admin') // <<<< این روت هم باید قبل از /:id بیاد
    .get(isAdmin, getAllStudentRewardsForAdmin);

studentRewardRouter.route('/my-stats')      // این روت هم استاتیک است و مشکلی نداره اگر قبل از /:id باشه
    .get(getMyRewardStats);
studentRewardRouter.get('/my-list', getMyRewardsListPaginated); // <<< روت جدید ما


// روت‌های مربوط به یک پاداش خاص (با پارامتر داینامیک id)
studentRewardRouter.route('/:id')           // <<<< این روت باید در انتها (یا بعد از روت‌های استاتیک مشابه) بیاد
    .get(getOneStudentReward) // در کنترلر این، بررسی کن که آیا کاربر اجازه دسترسی دارد
    .patch(isAdmin, changeStatusRe);



export default studentRewardRouter;