// Models/NotificationMd.js
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    userId: { // کاربری که این اعلان را دریافت می‌کند
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    title: {
        type: String,
        required: [true, 'عنوان اعلان الزامی است.'],
    },
    message: {
        type: String,
        required: [true, 'متن اعلان الزامی است.'],
    },
    type: { // برای دسته‌بندی اعلان‌ها (مثلاً فعالیت، پاداش، عمومی)
        type: String,
        enum: ['activity_status', 'reward_status', 'general_announcement', 'achievement'],
        default: 'activity_status',
    },
    relatedLink: { // لینکی که کاربر با کلیک روی اعلان به آن هدایت می‌شود
        type: String, 
        // مثلاً /my-activities یا /my-rewards
    },
    relatedDocId: { // آیدی داکیومنتی که اعلان به آن مربوط است (مثلاً StudentActivity ID)
        type: mongoose.Schema.Types.ObjectId,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    icon: { // برای نمایش آیکون‌های مختلف در فرانت (اختیاری)
        type: String, 
        default: 'BsChatDotsFill', // یک آیکون پیش‌فرض
    },
    iconBgColor: { // رنگ پس‌زمینه آیکون در فرانت (اختیاری)
        type: String,
        default: 'bg-teal-500', // رنگ پیش‌فرض
    },
}, {
    timestamps: true // فیلدهای createdAt و updatedAt را اضافه می‌کند
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;