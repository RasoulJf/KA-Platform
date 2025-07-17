// Controllers/notificationController.js

import Notification from '../Models/NotificationMd.js';
import catchAsync from '../Utils/catchAsync.js';

/**
 * @desc    Get current user's notifications
 * @route   GET /api/notifications
 * @access  Private (Student)
 */
export const getMyNotifications = catchAsync(async (req, res, next) => {
    const userId = req.userId;
    const { page = 1, limit = 10, filter = 'all' } = req.query; // filter can be 'all' or 'unread'

    const query = { userId };
    if (filter === 'unread') {
        query.isRead = false;
    }

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