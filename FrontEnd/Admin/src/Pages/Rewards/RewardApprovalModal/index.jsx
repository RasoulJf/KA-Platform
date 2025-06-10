// =========================================================================
// RewardApprovalModal.jsx (کامل)
// =========================================================================
import React, { useMemo } from 'react'; // useState و useEffect دیگر لازم نیست چون پراپ‌ها را می‌گیرد
import { IoClose } from 'react-icons/io5';

// کامپوننت کوچک برای نمایش فیلدهای فرم
const DisplayField = ({ label, value, fullWidth = false }) => (
    <div className={`mb-5 ${fullWidth ? 'col-span-2' : ''}`}>
        <label className="block text-xs text-gray-500 text-right mb-1">{label}</label>
        <div className="bg-gray-50 p-3 rounded-md border-b-2 border-gray-200 text-right shadow-sm"> {/* استایل کمی بهتر */}
            <span className="text-indigo-700 font-semibold text-sm">{value || ' - '}</span> {/* مقدار پیش‌فرض اگر خالی بود */}
        </div>
    </div>
);

export default function RewardApprovalModal({ isOpen, onClose, rewardData, onConfirm }) {
    // تاریخ امروز برای نمایش به عنوان تاریخ پرداخت (اگر تایید شود)
    const paymentApprovalDate = useMemo(() =>
        new Intl.DateTimeFormat('fa-IR', { dateStyle: 'long' }).format(new Date())
    , [isOpen]); // فقط وقتی مودال باز می‌شود محاسبه شود

    if (!isOpen || !rewardData) return null;

    // نام دانش‌آموز با پایه (اگر وجود دارد)
    const displayName = `${rewardData.userName || 'دانش‌آموز نامشخص'} ${rewardData.userGrade ? `(${rewardData.userGrade})` : ''}`;

    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-[70] p-4" dir="rtl"> {/* z-index بیشتر شد */}
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 sm:p-8 relative animate-modalShow transform transition-all duration-300 ease-out">
                <button
                    onClick={onClose}
                    className="absolute top-4 left-4 text-gray-500 hover:text-red-600 p-1.5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
                    aria-label="بستن"
                >
                    <IoClose size={24} />
                </button>

                <h2 className="text-xl sm:text-2xl font-bold text-center text-indigo-700 mb-6 sm:mb-8">
                    فرم تایید درخواست پاداش
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5">
                    <DisplayField label="تاریخ ثبت درخواست" value={rewardData.submissionDate || 'نامشخص'} />
                    <DisplayField label="نام و نام‌خانوادگی دانش‌آموز" value={displayName} />
                    <DisplayField label="عنوان پاداش درخواستی" value={rewardData.rewardTitle || 'نامشخص'} fullWidth={true} />
                    {rewardData.rewardDescription && (
                        <DisplayField label="شرح پاداش" value={rewardData.rewardDescription} fullWidth={true} />
                    )}
                    <DisplayField label="تاریخ تایید/پرداخت (امروز)" value={paymentApprovalDate} />
                    <DisplayField label="تعداد توکن درخواستی" value={rewardData.tokenAmountRequired ? `${rewardData.tokenAmountRequired.toLocaleString('fa-IR')} توکن` : 'نامشخص'} />
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={() => onConfirm(rewardData.studentRewardId, 'rejected')}
                        className="w-full sm:w-auto order-2 sm:order-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 px-8 rounded-lg transition duration-150 ease-in-out shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                    >
                        رد کردن درخواست
                    </button>
                    <button
                        onClick={() => onConfirm(rewardData.studentRewardId, 'approved')}
                        className="w-full sm:w-auto order-1 sm:order-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 px-8 rounded-lg transition duration-150 ease-in-out shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                    >
                        تایید و پرداخت پاداش
                    </button>
                </div>
            </div>
        </div>
    );
}