// =========================================================================
// RequestRewardPage.jsx (کامل با مودال تعریف شده در داخل)
// =========================================================================
import React, { useState, useEffect, useMemo } from 'react';
import fetchData from '../../../Utils/fetchData'; // مسیر صحیح به fetchData
import { BiSolidSchool } from "react-icons/bi";
import { IoClose, IoNotificationsOutline } from "react-icons/io5";
import { FaGraduationCap, FaDollarSign, FaGift, FaLandmark } from "react-icons/fa";
// اگر از useNavigate استفاده می‌کنید: import { useNavigate } from 'react-router-dom';

// آیکون‌های پیش‌فرض
const DEFAULT_ICONS = {
  "پاداش‌های عمومی": FaGift,
  "پاداش‌های اختصاصی": FaGraduationCap,
  "پاداش نیکوکارانه": FaDollarSign,
  "default": FaGift
};

// تم‌های رنگی پیش‌فرض
const DEFAULT_THEMES = {
  "پاداش‌های عمومی": { color: "pink", bgColor: "bg-pink-50", iconBgColor: "bg-pink-500", buttonBgColor: "bg-pink-500", buttonHoverColor: "hover:bg-pink-600", textColor: "text-pink-700" },
  "پاداش‌های اختصاصی": { color: "red", bgColor: "bg-red-50", iconBgColor: "bg-red-500", buttonBgColor: "bg-red-600", buttonHoverColor: "hover:bg-red-700", textColor: "text-red-700" },
  "پاداش نیکوکارانه": { color: "green", bgColor: "bg-green-50", iconBgColor: "bg-green-500", buttonBgColor: "bg-green-500", buttonHoverColor: "hover:bg-green-600", textColor: "text-green-700" },
  "default": { color: "blue", bgColor: "bg-blue-50", iconBgColor: "bg-blue-500", buttonBgColor: "bg-blue-500", buttonHoverColor: "hover:bg-blue-600", textColor: "text-blue-700" }
};

// ===================================================================================
// کامپوننت مودال برای وارد کردن مقدار توکن
// ===================================================================================
function RequestRewardTokenModal({
  isOpen,
  onClose,
  onSubmit,
  rewardDetails,
  submitting,
  message,
  currentUserTokens // موجودی توکن فعلی کاربر
}) {
  const [tokenAmount, setTokenAmount] = useState('');

  const submissionDate = useMemo(() =>
    new Intl.DateTimeFormat('fa-IR', { dateStyle: 'long' }).format(new Date())
  , []);

  useEffect(() => {
    if (isOpen && rewardDetails) {
      setTokenAmount(rewardDetails.minToken ? String(rewardDetails.minToken) : '');
    }
    if (!isOpen) {
        setTokenAmount('');
    }
  }, [isOpen, rewardDetails]);

  if (!isOpen || !rewardDetails) return null;

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(tokenAmount);
    }
  };

  const canSubmit = !submitting &&
                    tokenAmount && Number(tokenAmount) > 0 &&
                    (!rewardDetails.minToken || Number(tokenAmount) >= rewardDetails.minToken) &&
                    (!rewardDetails.maxToken || Number(tokenAmount) <= rewardDetails.maxToken) &&
                    (currentUserTokens === undefined || Number(tokenAmount) <= currentUserTokens);

  return (
    <div dir="rtl" className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 transition-opacity duration-300 ease-in-out">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md relative transform transition-all duration-300 ease-in-out scale-100">
        <button
          onClick={onClose}
          className="absolute top-3 left-3 text-gray-400 hover:text-gray-700 p-1.5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
          aria-label="بستن"
        >
          <IoClose size={22} />
        </button>

        <div className="text-center mb-6">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800">{rewardDetails.title}</h3>
          {rewardDetails.parent && (
            <p className="text-xs text-gray-500 mt-0.5">دسته: {rewardDetails.parent}</p>
          )}
        </div>

        {message && message.text && (
          <div
            className={`p-3 rounded-md text-sm text-center mb-4 font-medium ${
              message.type === 'success' ? 'bg-green-100 text-green-700'
              : message.type === 'error' ? 'bg-red-100 text-red-700'
              : 'bg-blue-100 text-blue-700'
            }`}
          >
            {message.text}
          </div>
        )}

        {message?.type !== 'success' && (
          <form onSubmit={handleFormSubmit} className="space-y-5">
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm">
              <div className="flex justify-between items-center text-gray-600">
                <span>تاریخ درخواست:</span>
                <span className="font-medium text-gray-700">{submissionDate}</span>
              </div>
              {rewardDetails.description && (
                <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200">{rewardDetails.description}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 text-right">
                توکن مورد نیاز برای این پاداش
              </label>
              <div className="p-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-700 text-sm text-center font-medium">
                {rewardDetails.minToken?.toLocaleString('fa-IR') || '۰'}
                {rewardDetails.maxToken && rewardDetails.maxToken !== rewardDetails.minToken ? `  تا  ${rewardDetails.maxToken.toLocaleString('fa-IR')}` : ''}
                {' توکن'}
              </div>
            </div>

            <div>
              <label htmlFor="requestedTokenAmount" className="block text-sm font-medium text-gray-700 mb-1.5 text-right">
                مقدار توکنی که می‌خواهید خرج کنید <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="requestedTokenAmount"
                name="requestedTokenAmount"
                value={tokenAmount}
                onChange={(e) => setTokenAmount(e.target.value)}
                min={rewardDetails.minToken || 0}
                max={rewardDetails.maxToken || undefined}
                required
                disabled={submitting}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#19A297] focus:border-[#19A297] text-gray-800 text-sm text-center placeholder-gray-400 appearance-none"
                placeholder={rewardDetails.minToken ? `حداقل ${rewardDetails.minToken.toLocaleString('fa-IR')}` : "مقدار توکن"}
              />
              {currentUserTokens !== undefined && (
                  <p className="text-xs text-gray-500 mt-1 text-right">
                      موجودی توکن شما: {currentUserTokens.toLocaleString('fa-IR')}
                  </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row-reverse gap-3 pt-2">
              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full sm:flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-150 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {submitting ? "در حال ارسال..." : "تایید و ثبت درخواست"}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="w-full sm:flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2.5 px-4 rounded-lg transition-colors duration-150 disabled:opacity-70"
              >
                انصراف
              </button>
            </div>
          </form>
        )}

        {message?.type === 'success' && (
            <div className="mt-6 text-center">
                <button
                    type="button"
                    onClick={onClose}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2.5 px-6 rounded-lg transition-colors"
                >
                    بستن
                </button>
            </div>
        )}
      </div>
    </div>
  );
}

// ===================================================================================
// کامپوننت اصلی صفحه درخواست پاداش
// ===================================================================================
export default function RequestRewardPage({ Open }) {
  const token = localStorage.getItem("token");
  // const navigate = useNavigate(); // اگر نیاز به هدایت دارید، از کامنت خارج کنید

  const [rewardsFromApi, setRewardsFromApi] = useState([]);
  const [loadingRewards, setLoadingRewards] = useState(true);
  const [errorRewards, setErrorRewards] = useState(null);
  const [userCurrentTokens, setUserCurrentTokens] = useState(undefined);

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedRewardForRequest, setSelectedRewardForRequest] = useState(null);
  const [submittingRewardRequest, setSubmittingRewardRequest] = useState(false);
  const [rewardRequestMessage, setRewardRequestMessage] = useState({ type: '', text: '' });

  const dateDisplay = useMemo(() => {
    const date = new Date();
    const month = new Intl.DateTimeFormat('fa-IR', { month: 'long' }).format(date);
    const day = new Intl.DateTimeFormat('fa-IR', { day: 'numeric' }).format(date);
    const year = new Intl.DateTimeFormat('fa-IR', { year: 'numeric' }).format(date).replace(/([۰-۹])/g, token => String.fromCharCode(token.charCodeAt(0) - 1728 + 48)); // تبدیل اعداد سال به فارسی
    const week = new Intl.DateTimeFormat('fa-IR', { weekday: 'long' }).format(date);
    return `امروز ${week}، ${day} ${month}، ${year}`; // ویرگول اضافه شد
  }, []);

  // ۱. فچ کردن لیست پاداش‌ها و موجودی توکن کاربر
  useEffect(() => {
    const loadInitialData = async () => {
      if (!token) {
        setErrorRewards("توکن احراز هویت یافت نشد. لطفاً دوباره وارد شوید.");
        setLoadingRewards(false);
        // navigate('/login'); // یا هر صفحه لاگین دیگر
        return;
      }
      setLoadingRewards(true);
      setErrorRewards(null);

      try {
        // Promise.all برای اجرای همزمان درخواست‌ها
        const [rewardsResponse, userDataResponse] = await Promise.all([
          fetchData('reward', { headers: { authorization: `Bearer ${token}` } }),
          fetchData('student-dashboard', { headers: { authorization: `Bearer ${token}` } }) // یا اندپوینت پروفایل کاربر
        ]);

        // پردازش پاسخ لیست پاداش‌ها
        if (rewardsResponse.success && Array.isArray(rewardsResponse.data)) {
          const formattedRewards = rewardsResponse.data.map(reward => {
            const theme = DEFAULT_THEMES[reward.parent] || DEFAULT_THEMES.default;
            const Icon = DEFAULT_ICONS[reward.parent] || DEFAULT_ICONS.default;
            return {
              id: reward._id,
              title: reward.name,
              amount: (reward.minToken && reward.maxToken) ?
                `${reward.minToken.toLocaleString('fa-IR')} - ${reward.maxToken.toLocaleString('fa-IR')} توکن` :
                (reward.minToken ? `حداقل ${reward.minToken.toLocaleString('fa-IR')} توکن` : 'متغیر'),
              description: reward.description || '', // اطمینان از وجود مقدار پیش‌فرض
              parent: reward.parent,
              minToken: reward.minToken,
              maxToken: reward.maxToken,
              Icon,
              ...theme
            };
          });
          setRewardsFromApi(formattedRewards);
        } else {
          setErrorRewards(rewardsResponse.message || "خطا در دریافت لیست پاداش‌ها.");
          setRewardsFromApi([]);
        }

        // پردازش پاسخ اطلاعات کاربر (برای موجودی توکن)
        if (userDataResponse.success && userDataResponse.data && userDataResponse.data.availableTokens !== undefined) {
          setUserCurrentTokens(userDataResponse.data.availableTokens);
        } else {
          console.warn("موجودی توکن کاربر دریافت نشد:", userDataResponse.message);
          // setUserCurrentTokens(0); // یا یک مقدار پیش‌فرض دیگر
        }

      } catch (err) {
        setErrorRewards("خطای شبکه یا سرور: " + (err.message || "خطای ناشناخته"));
        setRewardsFromApi([]);
      } finally {
        setLoadingRewards(false);
      }
    };
    loadInitialData();
  }, [token]); // navigate اگر استفاده شود باید به dependency array اضافه شود


  const handleRequestRewardClick = (reward) => {
    setSelectedRewardForRequest(reward);
    setIsRequestModalOpen(true);
    setRewardRequestMessage({ type: '', text: '' });
  };

  const handleCloseRequestModal = () => {
    setIsRequestModalOpen(false);
    setSelectedRewardForRequest(null);
    if (rewardRequestMessage.type === 'success') {
        setRewardRequestMessage({ type: '', text: '' });
    }
  };

  const handleConfirmRewardRequest = async (requestedTokenAmountStr) => {
    if (!selectedRewardForRequest || !token) {
      setRewardRequestMessage({ type: 'error', text: 'اطلاعات پاداش یا توکن نامعتبر است.' });
      return;
    }
    const requestedTokens = parseInt(requestedTokenAmountStr, 10);

    // اعتبار سنجی‌ها در خود مودال هم انجام می‌شود، اما یکبار دیگر اینجا هم چک می‌کنیم
    if (isNaN(requestedTokens) || requestedTokens <= 0) {
      setRewardRequestMessage({ type: 'error', text: 'مقدار توکن وارد شده معتبر نیست.' });
      return;
    }
    if ((selectedRewardForRequest.minToken && requestedTokens < selectedRewardForRequest.minToken) ||
      (selectedRewardForRequest.maxToken && requestedTokens > selectedRewardForRequest.maxToken)) {
      setRewardRequestMessage({ type: 'error', text: `مقدار توکن باید بین ${selectedRewardForRequest.minToken || 0} و ${selectedRewardForRequest.maxToken || 'بی‌نهایت'} باشد.` });
      return;
    }
    if (userCurrentTokens !== undefined && requestedTokens > userCurrentTokens) {
        setRewardRequestMessage({ type: 'error', text: 'موجودی توکن شما برای این درخواست کافی نیست.' });
        return;
    }

    setSubmittingRewardRequest(true);
    setRewardRequestMessage({ type: '', text: '' });

    const payload = {
      rewardId: selectedRewardForRequest.id,
      token: requestedTokens
    };

    try {
      const response = await fetchData('student-reward', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.success) {
        setRewardRequestMessage({ type: 'success', text: `درخواست برای "${selectedRewardForRequest.title}" با موفقیت ثبت شد و در انتظار تایید است.` });
        if (userCurrentTokens !== undefined) {
          setUserCurrentTokens(prevTokens => prevTokens - requestedTokens); // آپدیت موجودی توکن در UI
        }
        // نیازی به بستن مودال از اینجا نیست، مودال خودش دکمه بستن را نمایش می‌دهد
      } else {
        setRewardRequestMessage({ type: 'error', text: response.message || "خطا در ثبت درخواست پاداش." });
      }
    } catch (err) {
      setRewardRequestMessage({ type: 'error', text: "خطای شبکه یا سرور: " + (err.message || "خطای ناشناخته") });
    } finally {
      setSubmittingRewardRequest(false);
    }
  };


  return (
    <>
      <div className={`${!Open ? "w-[calc(100%-6%)]" : "w-[calc(100%-20%)]"} p-6 md:p-8 transition-all duration-500 flex-col h-screen overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100`}>
        {/* هدر بالا */}
        <div className="flex flex-col sm:flex-row justify-between items-center h-auto sm:h-[5vh] mb-8">
          <div className="flex justify-center items-center gap-3 sm:gap-5 mb-2 sm:mb-0">
            <h3 className="text-[#19A297] text-xs sm:text-sm">هنرستان استارتاپی رکاد</h3>
            <BiSolidSchool className="text-[#19A297] ml-[-8px] sm:ml-[-10px] text-lg sm:text-xl" />
            <div className="w-7 h-7 sm:w-8 sm:h-8 flex justify-center items-center border border-gray-300 rounded-full relative cursor-pointer group">
              <IoNotificationsOutline className="text-gray-400 text-sm sm:text-base" />
              {/* <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span> */} {/* نمایش تعداد اعلان‌ها اگر وجود دارد */}
            </div>
          </div>
          <div className="flex justify-center items-center gap-3 sm:gap-5">
            <p className="text-gray-400 text-xs sm:text-sm">{dateDisplay}</p>
            <h1 className="text-[#19A297] font-semibold text-base sm:text-lg">ثبت درخواست پاداش</h1>
          </div>
        </div>

        {loadingRewards && (
          <div className="text-center py-10"><p className="text-lg text-gray-600">در حال بارگذاری لیست پاداش‌ها...</p></div>
        )}
        {errorRewards && !loadingRewards && (
          <div className="text-center py-10 bg-red-50 p-4 rounded-md"><p className="text-lg text-red-600">{errorRewards}</p></div>
        )}
        {!loadingRewards && !errorRewards && rewardsFromApi.length === 0 && (
          <div className="text-center py-10"><p className="text-lg text-gray-500">در حال حاضر پاداشی برای درخواست وجود ندارد.</p></div>
        )}

        {!loadingRewards && !errorRewards && rewardsFromApi.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full gap-6 md:gap-8" dir="rtl">
            {rewardsFromApi.map((reward) => (
              <div
                key={reward.id}
                className={`relative ${reward.bgColor} p-5 rounded-xl shadow-lg flex flex-col justify-between text-right min-h-[200px] sm:min-h-[220px] overflow-hidden border-2 border-transparent hover:border-current hover:shadow-xl transition-all duration-300 group`}
                style={{'--tw-border-opacity': 0.3, borderColor: reward.color === 'pink' ? '#ec4899' : reward.color === 'red' ? '#ef4444' : reward.color === 'green' ? '#22c55e' : '#3b82f6' }} // رنگ بوردر داینامیک
              >
                <div className={`absolute -top-10 -left-10 w-28 h-28 ${reward.iconBgColor}/30 rounded-full opacity-60 z-0 group-hover:scale-125 transition-transform duration-500`}></div>
                <div className={`absolute -bottom-8 -right-8 w-36 h-36 ${reward.iconBgColor}/20 rounded-full opacity-50 z-0 group-hover:scale-110 transition-transform duration-500`}></div>

                <div className="flex justify-between items-start z-10">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${reward.iconBgColor} flex items-center justify-center text-white text-2xl sm:text-3xl shadow-md flex-shrink-0`}>
                    <reward.Icon />
                  </div>
                  <div className="flex-1 mr-3.5">
                    <h3 className={`text-base sm:text-lg font-semibold ${reward.textColor.replace('700', '800')}`}>{reward.title}</h3>
                    {reward.description && <p className="text-xs text-gray-600 mt-1 line-clamp-2">{reward.description}</p>}
                  </div>
                </div>
                <div className="z-10 mt-3">
                  <div className={`flex items-center justify-start text-xs sm:text-sm ${reward.textColor} mb-3`}>
                    <FaLandmark className={`ml-1.5 opacity-80`} />
                    <span className="font-medium">{reward.amount}</span>
                  </div>
                  <button
                    onClick={() => handleRequestRewardClick(reward)}
                    className={`w-full ${reward.buttonBgColor} ${reward.buttonHoverColor} text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2`}
                    style={{'--tw-ring-color': reward.color === 'pink' ? '#ec4899' : reward.color === 'red' ? '#ef4444' : reward.color === 'green' ? '#22c55e' : '#3b82f6' }}
                  >
                    ثبت درخواست این پاداش
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="h-16"></div> {/* Padding at bottom */}
      </div>

      {/* مودال برای وارد کردن مقدار توکن و تایید نهایی */}
      <RequestRewardTokenModal
        isOpen={isRequestModalOpen}
        onClose={handleCloseRequestModal}
        onSubmit={handleConfirmRewardRequest}
        rewardDetails={selectedRewardForRequest}
        submitting={submittingRewardRequest}
        message={rewardRequestMessage}
        currentUserTokens={userCurrentTokens}
      />
    </>
  );
}