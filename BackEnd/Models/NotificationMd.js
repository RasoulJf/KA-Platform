import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    userId: { // کاربری که این اعلان را دریافت می‌کند (می‌تواند دانش‌آموز یا ادمین باشد)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // همچنان به مدل User اشاره می‌کند
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
    type: { // دسته‌بندی اعلان‌ها (انواع جدید برای ادمین اضافه شد)
        type: String,
        enum: [
            // انواع اعلان برای دانش‌آموز
            'activity_status', 
            'reward_status', 
            'general_announcement', 
            'achievement',
            
            // <<< انواع اعلان جدید برای ادمین >>>
            'new_activity_submission', // درخواست فعالیت جدید
            'new_reward_request',      // درخواست پاداش جدید
            'admin_general'            // اعلان عمومی برای ادمین‌ها
        ],
        required: true, // بهتر است این فیلد همیشه مقدار داشته باشد
    },
    relatedLink: { // لینکی که کاربر با کلیک روی اعلان به آن هدایت می‌شود
        type: String, 
        // برای دانش‌آموز: /my-activities
        // برای ادمین: /admin/review-activities/65e...
    },
    relatedDocId: { // آیدی داکیومنتی که اعلان به آن مربوط است (مثلاً StudentActivity ID)
        type: mongoose.Schema.Types.ObjectId,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    icon: { 
        type: String, 
        default: 'BsChatDotsFill',
    },
    iconBgColor: {
        type: String,
        default: 'bg-teal-500',
    },
}, {
    timestamps: true 
});

// این ایندکس باعث می‌شود که پیدا کردن اعلان‌های یک کاربر خاص بسیار سریع‌تر شود
notificationSchema.index({ userId: 1, isRead: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;