import express from "express"
import isAdmin from "../Middlewares/isAdmin.js"
import { createAdminActivity, createBulkAdminActivitiesFromExcel, getActivitiesByParent, getActivityParentCategories, getAdminActivitiesCount, getAllAdminActivities, getAllAdminActivitiesForUser, getOneAdminActivity } from "../Controllers/AdminActivityCn.js"
import upload from "../Utils/uploadFile.js"
const adminActivityRouter=express.Router()
adminActivityRouter.route('').get(isAdmin,getAllAdminActivities)
adminActivityRouter.route('/stats/count').get(isAdmin,getAdminActivitiesCount)
adminActivityRouter.get('/distinct/parents', getActivityParentCategories);
adminActivityRouter.post(
    '/bulk-create-from-excel/:parentCategory',
    upload.single('file'), // نام فیلد فایل در FormData باید 'file' باشد
    createBulkAdminActivitiesFromExcel
);
adminActivityRouter.route('/definitions/by-parent/:parentCategory') // قبلا isAdmin نداشت، اضافه کردم
    .get(getActivitiesByParent); 
    adminActivityRouter.route('/user/:userId') // پارامتر روت :userId
    .post(createAdminActivity) // POST /api/admin-activity/user/USER_ID (ثبت فعالیت برای کاربر خاص)
    .get(getAllAdminActivitiesForUser); // GET /api/admin-activity/user/USER_ID (دریافت تمام فعالیت‌های ثبت شده برای کاربر خاص)

export default adminActivityRouter



adminActivityRouter