// Routes/activityRouter.js
import express from "express"
import {
    createActivity,
    findActivityByDetails, // این دیگر در فرم فردی استفاده نخواهد شد
    getAllActivities,
    getOneActivity,
    removeActivity,
    getActivitiesByParent // <--- تابع جدید را import کنید
} from "../Controllers/ActivityCn.js"
import isSuperAdmin from "../Middlewares/isSuperAdmin.js"
// import { protect } from '../middlewares/authMiddleware.js'; // مثال اگر نیاز به احراز هویت ادمین عادی هم هست

const activityRouter = express.Router()

activityRouter.route('/').post(isSuperAdmin, createActivity).get(getAllActivities) // getAllActivities ممکن است نیاز به protect داشته باشد

// --- روت جدید ---
// GET /api/activity/by-parent?parent=فعالیت‌های آموزشی
activityRouter.get('/by-parent', /* protect, */ getActivitiesByParent); // <--- روت جدید
// در صورت نیاز، میدلور protect را برای احراز هویت (مثلاً ادمین) فعال کنید

activityRouter.get('/find-by-details', findActivityByDetails); // این روت هنوز ممکن است در جاهای دیگر استفاده شود یا برای جستجوی دستی
activityRouter.route('/:id').get(getOneActivity).delete(isSuperAdmin, removeActivity) // getOneActivity ممکن است نیاز به protect داشته باشد

export default activityRouter