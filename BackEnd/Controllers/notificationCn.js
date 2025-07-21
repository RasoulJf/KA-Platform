// Controllers/notificationController.js

import Notification from '../Models/NotificationMd.js';
import catchAsync from '../Utils/catchAsync.js';

/**
 * @desc    Get current user's notifications
 * @route   GET /api/notifications
 * @access  Private (Student)
 */
/**
 * @desc    Get notifications for the current user (student or admin)
 * @route   GET /api/notifications
 * @access  Private (Student, Admin, SuperAdmin)
 */
export const getMyNotifications = catchAsync(async (req, res, next) => {
    const userId = req.userId;
    const userRole = req.role; // <<< تغییر از req.userRole به req.role
    
    console.log("--- Get My Notifications ---");
    console.log("User ID:", userId);
    console.log("User Role:", userRole);

    const { page = 1, limit = 10, filter = 'all' } = req.query; 

    const query = { userId: userId };

    // اگر کاربر ادمین یا سوپرادمین است، فقط اعلان‌های مربوط به ادمین را نشان بده
    if (userRole === 'admin' || userRole === 'superAdmin') {
        console.log("User is an admin. Filtering for admin types.");

        query.type = { 
            $in: [
                'new_activity_submission', 
                'new_reward_request',
                'admin_general'
            ] 
        };
    } else { // اگر کاربر دانش‌آموز است، فقط اعلان‌های مربوط به دانش‌آموز را نشان بده
        query.type = {
            $in: [
                'activity_status',
                'reward_status',
                'general_announcement',
                'achievement'
            ]
        };
    }

    if (filter === 'unread') {
        query.isRead = false;
    }
    console.log("Final MongoDB Query:", JSON.stringify(query, null, 2)); // <<<< این خیلی مهمه!


    // بقیه کد بدون تغییر ...
    const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));

    const totalCount = await Notification.countDocuments(query);

    res.status(200).json({
        success: true,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: Number(page),
        data: notifications,
    });
});

/**
 * @desc    Mark notifications as read
 * @route   PATCH /api/notifications/mark-as-read
 * @access  Private (Student)
 */
export const markNotificationsAsRead = catchAsync(async (req, res, next) => {
    const userId = req.userId;
    const { notificationIds } = req.body; // an array of IDs to mark as read

    if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
        // If no IDs are provided, mark all unread as read
        await Notification.updateMany(
            { userId, isRead: false },
            { $set: { isRead: true } }
        );
        return res.status(200).json({ success: true, message: "تمام اعلان‌ها خوانده شد." });
    }

    // Mark specific notifications as read
    const result = await Notification.updateMany(
        { _id: { $in: notificationIds }, userId }, // Security: ensure user owns the notifications
        { $set: { isRead: true } }
    );

    res.status(200).json({
        success: true,
        message: `${result.nModified} اعلان خوانده شد.`
    });
});

// این تابع برای اضافه شدن به کنترلر داشبورد است اما منطقش اینجا نوشته شده
// export const getUnreadNotificationCount = catchAsync(async (userId) => {
//     return await Notification.countDocuments({ userId, isRead: false });
// });


export const markAllAsRead = catchAsync(async (req, res, next) => {
    const userId = req.userId; // از میدل‌ور احراز هویت (isLogin) می‌آید

    // تمام اعلان‌های کاربر که isRead: false هستند را پیدا کرده و isRead: true را برایشان ست می‌کنیم
    await Notification.updateMany(
        { userId: userId, isRead: false }, // شرط: اعلان‌های کاربر فعلی که خوانده نشده‌اند
        { $set: { isRead: true } }        // عملیات: isRead را به true تغییر بده
    );

    res.status(200).json({
        success: true,
        message: 'تمام اعلان‌ها به عنوان خوانده شده علامت‌گذاری شدند.'
    });
});

export const markOneAsRead = catchAsync(async (req, res, next) => {
    const userId = req.userId; // از میدل‌ور isLogin
    const { id: notificationId } = req.params; // آیدی اعلان را از پارامتر URL می‌گیریم

    if (!notificationId) {
        return res.status(400).json({ success: false, message: "شناسه اعلان ارسال نشده است." });
    }

    // اعلان را فقط در صورتی آپدیت می‌کنیم که متعلق به کاربر لاگین شده باشد
    // این یک اقدام امنیتی مهم است
    const result = await Notification.updateOne(
        { _id: notificationId, userId: userId }, // شرط: هم آیدی اعلان و هم آیدی کاربر باید مطابقت داشته باشد
        { $set: { isRead: true } }
    );

    // اگر هیچ داکیومنتی آپدیت نشد، یعنی اعلان متعلق به این کاربر نبوده یا وجود نداشته
    if (result.nModified === 0) {
        // می‌توانید اینجا خطا برنگردانید و فقط یک پیام موفقیت با 0 بدهید
        // چون فرانت‌اند از قبل UI را آپدیت کرده است.
    }

    res.status(200).json({
        success: true,
        message: 'اعلان خوانده شد.'
    });
});