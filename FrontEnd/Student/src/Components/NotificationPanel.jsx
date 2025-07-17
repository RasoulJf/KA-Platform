import React from 'react';
import { IoClose } from 'react-icons/io5'; // برای دکمه بستن احتمالی (در تصویر نیست اما مفید است)
import { BsChatDotsFill } from "react-icons/bs"; // آیکون نمونه برای اعلان‌ها

// داده‌های نمونه برای اعلان‌ها
const notificationsData = [
  {
    id: 1,
    title: "درخواست دریافت پاداش",
    message: "درخواست دریافت پاداش شما توسط ادمین رد شد.",
    time: "۵ ساعت پیش",
    icon: BsChatDotsFill, // می‌توانید آیکون‌های مختلف برای انواع اعلان‌ها داشته باشید
    iconBgColor: "bg-teal-500", // رنگ پس‌زمینه آیکون
    read: false, // برای تمایز اعلان‌های خوانده شده و نشده (اختیاری)
  },
  {
    id: 2,
    title: "درخواست دریافت امتیاز",
    message: "امتیاز درخواستی به حساب شما واریز شد.",
    time: "۵ ساعت پیش",
    icon: BsChatDotsFill,
    iconBgColor: "bg-teal-500",
    read: false,
  },
  {
    id: 3,
    title: "درخواست دریافت پاداش",
    message: "درخواست دریافت پاداش شما توسط ادمین قبول شد.",
    time: "۵ ساعت پیش",
    icon: BsChatDotsFill,
    iconBgColor: "bg-teal-100", // رنگ متفاوت برای وضعیت دیگر
    textColor: "text-gray-500", // رنگ متن متفاوت برای وضعیت دیگر
    iconColor: "text-teal-600", // رنگ آیکون متفاوت برای وضعیت دیگر
    read: true,
  },
  {
    id: 4,
    title: "درخواست دریافت پاداش",
    message: "درخواست دریافت پاداش شما توسط ادمین رد شد.",
    time: "۵ ساعت پیش",
    icon: BsChatDotsFill,
    iconBgColor: "bg-teal-500",
    read: false,
  },
];

const NotificationPanel = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="absolute top-16 right-4 sm:right-[-200px] md:right-[-200px] w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-40 overflow-hidden"
      dir="rtl"
    >
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">اعلان ها</h3>
        {/* دکمه بستن اختیاری، در تصویر شما نیست */}
        {/* <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <IoClose size={20} />
        </button> */}
      </div>
      <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {notificationsData.length === 0 ? (
          <p className="text-center text-gray-500 py-6">هیچ اعلان جدیدی وجود ندارد.</p>
        ) : (
          notificationsData.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 flex items-start gap-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors cursor-pointer ${
                !notification.read ? '' : 'opacity-70' // مثال برای اعلان خوانده شده
              }`}
            >
              <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${notification.iconBgColor}`}>
                <notification.icon className={`${notification.iconColor || 'text-white'} text-xl sm:text-2xl`} />
              </div>
              <div className="flex-grow">
                <h4 className={`font-semibold text-sm ${notification.textColor || 'text-gray-800'}`}>{notification.title}</h4>
                <p className={`text-xs ${notification.textColor || 'text-gray-600'} mt-0.5`}>{notification.message}</p>
                <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
              </div>
// components/NotificationPanel.jsx (نسخه کامل و نهایی)

import React, { useEffect, useState } from 'react';
import { IoClose } from 'react-icons/io5';
import fetchData from '../Utils/fetchData'; // مطمئن شوید مسیر صحیح است
import { formatDistanceToNow } from 'date-fns-jalali'; // کتابخانه برای نمایش زمان نسبی

// آیکون‌ها
import { BsChatDotsFill, BsCheckCircleFill, BsXCircleFill } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';

const iconMap = {
    'activity_status': BsChatDotsFill,
    'reward_status_approved': BsCheckCircleFill,
    'reward_status_rejected': BsXCircleFill,
    'general_announcement': BsChatDotsFill,
    // می‌توانید برای انواع دیگر اعلان‌ها هم آیکون تعریف کنید
};

const NotificationPanel = ({ isOpen, onClose, token }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false); // پیش‌فرض false
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!isOpen || !token) return;
            
            setLoading(true);
            setError(null);
            
            try {
                // فقط 7 اعلان آخر را می‌گیریم
                const response = await fetchData('notifications?limit=7', { headers: { authorization: Bearer ${token} } });
                
                if (response.success && Array.isArray(response.data)) {
                    setNotifications(response.data);
                } else {
                    setError(response.message || 'خطا در دریافت اطلاعات. فرمت پاسخ نامعتبر است.');
                }
            } catch (err) {
                console.error("Failed to fetch notifications:", err);
                setError(err.message || 'خطای شبکه در ارتباط با سرور.');
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [isOpen, token]);

    const handleMarkAsRead = async (id) => {
        // ابتدا در UI به سرعت آپدیت می‌کنیم
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        
        try {
            await fetchData('notifications/mark-as-read', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', authorization: Bearer ${token} },
                body: JSON.stringify({ notificationIds: [id] }), // فقط یک آیدی می‌فرستیم
            });
            // درخواست در پس‌زمینه ارسال می‌شود و نیازی به کار دیگری نیست
        } catch (err) {
            console.error("Failed to mark notification as read", err);
            // در صورت خطا، می‌توانیم UI را به حالت قبل برگردانیم (اختیاری)
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: false } : n));
        }
    };
    
    const handleNotificationClick = (notification) => {
        if (!notification.isRead) {
            handleMarkAsRead(notification._id);
        }
        if (notification.relatedLink) {
            navigate(notification.relatedLink);
            onClose(); // بستن پنل بعد از کلیک
        }
    };
    
    if (!isOpen) return null;
    
    return (
        <div 
          className="absolute top-16 right-4 sm:right-auto sm:left-4 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-40 overflow-hidden flex flex-col"
          dir="rtl"
        >
            <div className="p-4 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
                <h3 className="text-lg font-semibold text-gray-800">اعلان ها</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    <IoClose size={20} />
                </button>
            </div>
            <div className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {loading && <p className="text-center text-gray-500 py-6">در حال بارگذاری...</p>}
                {error && <p className="text-center text-red-600 bg-red-50 p-4">{error}</p>}
                {!loading && !error && notifications.length === 0 && <p className="text-center text-gray-500 py-6">هیچ اعلان جدیدی وجود ندارد.</p>}
                {!loading && !error && notifications.map((notification) => {
                    // آیکون را بر اساس نوع اعلان انتخاب می‌کنیم
                    const IconComponent = iconMap[notification.type] || BsChatDotsFill;
                    return (
                        <div
                            key={notification._id}
                            className={`p-4 flex items-start gap-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors cursor-pointer ${
                                !notification.isRead ? 'bg-blue-50' : 'opacity-80'
                            }`}
                            onClick={() => handleNotificationClick(notification)}
                        >
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${notification.iconBgColor || 'bg-gray-500'}`}>
                                <IconComponent className="text-white text-xl" />
                            </div>
                            <div className="flex-grow">
                                <h4 className="font-semibold text-sm text-gray-800">{notification.title}</h4>
                                <p className="text-xs text-gray-600 mt-0.5">{notification.message}</p>
                                <p className="text-xs text-gray-400 mt-1">{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
          ))
        )}
      </div>
      {notificationsData.length > 0 && (
        <div className="p-3 text-center border-t border-gray-200">
          <button className="text-sm text-[#19A297] hover:underline">مشاهده همه اعلان ها</button>
        </div>
      )}
    </div>
  );
          ))
        )}
      </div>
      {notificationsData.length > 0 && (
        <div className="p-3 text-center border-t border-gray-200">
          <button className="text-sm text-[#19A297] hover:underline">مشاهده همه اعلان ها</button>
        </div>
      )}
    </div>
  );
          ))
        )}
      </div>
      {notificationsData.length > 0 && (
        <div className="p-3 text-center border-t border-gray-200">
          <button className="text-sm text-[#19A297] hover:underline">مشاهده همه اعلان ها</button>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;