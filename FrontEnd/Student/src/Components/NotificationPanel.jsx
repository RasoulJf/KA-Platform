// components/NotificationPanel.jsx (نسخه نهایی و هوشمند)

import React, { useEffect, useState, useRef } from 'react';
import { IoClose, IoCheckmarkDoneCircleOutline, IoRefresh } from 'react-icons/io5';
import fetchData from '../Utils/fetchData';
import { formatDistanceToNow } from 'date-fns-jalali';
import { useNavigate } from 'react-router-dom';

// آیکون‌های لازم برای هر دو پنل را وارد می‌کنیم
import {
    BsChatDotsFill,     // عمومی
    BsCheckCircleFill,  // تایید
    BsXCircleFill,      // رد
    BsFileEarmarkPlusFill, // درخواست جدید (فعالیت)
    BsGiftFill          // درخواست جدید (جایزه) و دستاورد
} from 'react-icons/bs';

// مجموعه آیکون‌های دانش‌آموز
const studentIconMap = {
    'activity_status': BsChatDotsFill,
    'reward_status': BsCheckCircleFill,
    'achievement': BsGiftFill,
    'general_announcement': BsChatDotsFill,
};

// مجموعه آیکون‌های ادمین
const adminIconMap = {
    'new_activity_submission': BsFileEarmarkPlusFill,
    'new_reward_request': BsGiftFill,
    'admin_general': BsChatDotsFill,
};

// کامپوننت حالا یک prop به نام userType می‌پذیرد
const NotificationPanel = ({ isOpen, onClose, token, userType = 'student' }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [markingAllAsRead, setMarkingAllAsRead] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const navigate = useNavigate();

    // بر اساس userType، مجموعه آیکون مناسب انتخاب می‌شود
    const iconMap = userType === 'admin' ? adminIconMap : studentIconMap;

    const fetchNotificationsList = async () => {
        if (!token) return;
        setLoading(true);
        setIsRefreshing(true);
        setError(null);

        try {
            // اندپوینت بک‌اند خودش تشخیص می‌دهد چه اعلان‌هایی را برگرداند
            const response = await fetchData('notifications?limit=10', {
                headers: { authorization: `Bearer ${token}` }
            });
            if (response.success && Array.isArray(response.data)) {
                setNotifications(response.data);
            } else {
                setError(response.message || 'خطا در دریافت اطلاعات.');
            }
        } catch (err) {
            setError(err.message || 'خطای شبکه.');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchNotificationsList();
        }
    }, [isOpen, token]);

    const handleMarkAsRead = async (id) => {
        // Optimistic UI update
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        try {
            // بک‌اند برای خوانده‌شدن یک اعلان خاص
            await fetchData(`notifications/mark-as-read/${id}`, {
                method: 'PATCH',
                headers: { authorization: `Bearer ${token}` },
            });
        } catch (err) {
            console.error("Failed to mark notification as read", err);
            // Rollback on error
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: false } : n));
        }
    };

    const handleNotificationClick = (notification) => {
        if (!notification.isRead) {
            handleMarkAsRead(notification._id);
        }
        if (notification.relatedLink) {
            navigate(notification.relatedLink);
            onClose(); // بستن پنل پس از کلیک
        }
    };
    
    const handleMarkAllAsRead = async () => {
        setMarkingAllAsRead(true);
        const originalNotifications = [...notifications];
        // Optimistic UI update
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        try {
            const response = await fetchData('notifications/mark-all-as-read', {
                method: 'PATCH',
                headers: { authorization: `Bearer ${token}` }
            });
            if (!response.success) throw new Error(response.message || 'خطا در سرور');
        } catch (err) {
            console.error("Failed to mark all as read", err);
            setNotifications(originalNotifications); // Rollback on error
            alert('خطا در علامت‌گذاری اعلان‌ها.');
        } finally {
            setMarkingAllAsRead(false);
        }
    };

    if (!isOpen) return null;

    const hasUnreadNotifications = notifications.some(n => !n.isRead);

    return (
        <div className="absolute top-16 right-4 sm:right-auto sm:left-4 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-5000 flex flex-col" dir="rtl">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
                <div className="flex items-center gap-3">
                    <button onClick={fetchNotificationsList} disabled={isRefreshing || loading} title="تازه‌سازی" className="text-gray-500 hover:text-gray-800 disabled:opacity-50">
                        <IoRefresh className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                    <h3 className="text-lg font-semibold text-gray-800">اعلان ها</h3>
                </div>
                <div className="flex items-center gap-4">
                    {hasUnreadNotifications && (
                        <button onClick={handleMarkAllAsRead} disabled={markingAllAsRead} className="flex items-center gap-1.5 text-xs text-teal-600 hover:text-teal-800 disabled:opacity-50">
                            <IoCheckmarkDoneCircleOutline size={16} />
                            <span>{markingAllAsRead ? 'صبر کنید...' : 'خوانده شدن همه'}</span>
                        </button>
                    )}
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <IoClose size={20} />
                    </button>
                </div>
            </div>
            <div className="relative flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 max-h-[288px]">
                {loading && <p className="p-4 text-center text-gray-500">در حال بارگذاری...</p>}
                {error && <p className="p-4 text-center text-red-600 bg-red-50">{error}</p>}
                {!loading && notifications.length === 0 && <p className="p-4 text-center text-gray-500">هیچ اعلان جدیدی وجود ندارد.</p>}
                {!loading && notifications.map((notification) => {
                    const IconComponent = iconMap[notification.type] || BsChatDotsFill;
                    return (
                        <div key={notification._id} onClick={() => handleNotificationClick(notification)} className={`p-4 flex items-start gap-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 cursor-pointer ${!notification.isRead ? 'bg-blue-50/60' : 'opacity-80'}`}>
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
        </div>
    );
};

export default NotificationPanel;