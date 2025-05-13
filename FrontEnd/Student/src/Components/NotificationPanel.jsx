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
};

export default NotificationPanel;