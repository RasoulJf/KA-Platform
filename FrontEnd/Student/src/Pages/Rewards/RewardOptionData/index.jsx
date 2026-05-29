import React, { useState, useEffect, useRef, useMemo } from 'react';
import fetchData from '../../../Utils/fetchData';
import { BiSolidSchool } from "react-icons/bi";
import { IoClose, IoNotificationsOutline, IoArrowForward } from "react-icons/io5";
import * as Iconsax from 'iconsax-react';
import NotificationPanel from '../../../Components/NotificationPanel';
import DynamicIcon from '../../../Components/DynamicIcon';
import { IoIosArrowForward } from 'react-icons/io';

// مودال برای وارد کردن مقدار توکن
function RequestRewardTokenModal({
  isOpen,
  onClose,
  onSubmit,
  rewardDetails,
  submitting,
  message,
  currentUserTokens
}) {
  const [tokenAmount, setTokenAmount] = useState('');
  const submissionDate = useMemo(() =>
    new Intl.DateTimeFormat('fa-IR', { dateStyle: 'long' }).format(new Date()),
    []
  );

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
    <div dir="rtl" className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-3 left-3 text-gray-400 hover:text-gray-700 p-1.5 rounded-full"
          aria-label="بستن"
        >
          <IoClose size={22} />
        </button>

        <div className="text-start mb-6">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800">{rewardDetails.title}</h3>
          {rewardDetails.parent && (
            <p className="text-xs text-gray-500 mt-0.5">دسته: {rewardDetails.parent}</p>
          )}
        </div>

        {message && message.text && (
          <div className={`p-3 rounded-md text-sm text-start mb-4 font-medium ${message.type === 'success' ? 'bg-green-100 text-green-700' :
            message.type === 'error' ? 'bg-red-100 text-red-700' :
              'bg-blue-100 text-blue-700'
            }`}>
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
                <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200">
                  {rewardDetails.description}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 text-right">
                توکن مورد نیاز برای این پاداش
              </label>
              <div className="p-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-700 text-sm text-center font-medium">
                {rewardDetails.minToken?.toLocaleString('fa-IR') || '۰'}
                {rewardDetails.maxToken && rewardDetails.maxToken !== rewardDetails.minToken ?
                  ` تا ${rewardDetails.maxToken.toLocaleString('fa-IR')}` : ''}
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
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#19A297] focus:border-[#19A297] text-gray-800 text-sm text-center"
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
                className="w-full sm:flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-2.5 px-4 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {submitting ? "در حال ارسال..." : "تایید و ثبت درخواست"}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="w-full sm:flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2.5 px-4 rounded-lg disabled:opacity-70"
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
              className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2.5 px-6 rounded-lg"
            >
              بستن
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// کامپوننت اصلی صفحه درخواست پاداش
export default function RequestRewardPage({ Open }) {
  const token = localStorage.getItem("token");
  const [rewardsFromApi, setRewardsFromApi] = useState([]);
  const [loadingRewards, setLoadingRewards] = useState(true);
  const [errorRewards, setErrorRewards] = useState(null);
  const [userCurrentTokens, setUserCurrentTokens] = useState(undefined);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedRewardForRequest, setSelectedRewardForRequest] = useState(null);
  const [submittingRewardRequest, setSubmittingRewardRequest] = useState(false);
  const [rewardRequestMessage, setRewardRequestMessage] = useState({ type: '', text: '' });

  const notificationRef = useRef(null);

  // ✅ Helper to normalize icon name to match Iconsax component (PascalCase)
  const normalizeIconName = (name) => {
    if (!name) return "Gift";
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const dateInfo = useMemo(() => {
    const date = new Date();
    return {
      month: new Intl.DateTimeFormat('fa-IR', { month: 'long' }).format(date),
      day: new Intl.DateTimeFormat('fa-IR', { day: 'numeric' }).format(date),
      year: new Intl.DateTimeFormat('fa-IR', { year: 'numeric' }).format(date),
      week: new Intl.DateTimeFormat('fa-IR', { weekday: 'long' }).format(date),
    };
  }, []);

  // تابع برای بازگشت به صفحه قبل
  const handleGoBack = () => {
    window.history.back();
  };

  // بارگذاری داده‌ها
  useEffect(() => {
    const loadInitialData = async () => {
      if (!token) {
        setErrorRewards("توکن احراز هویت یافت نشد.");
        setLoadingRewards(false);
        return;
      }

      setLoadingRewards(true);
      setErrorRewards(null);

      try {
        const [rewardsResponse, userDataResponse] = await Promise.all([
          fetchData('reward', { headers: { authorization: `Bearer ${token}` } }),
          fetchData('student-dashboard', { headers: { authorization: `Bearer ${token}` } })
        ]);

        if (rewardsResponse.success && Array.isArray(rewardsResponse.data)) {
          // فیلتر کردن پاداش‌هایی که hide آنها true نیست
          const formattedRewards = rewardsResponse.data
            .filter(reward => reward.hide !== "true")
            .map(reward => {
              const iconName = normalizeIconName(reward.icon);
              console.log(iconName)
              const IconComponent = Iconsax[iconName] || Iconsax.Gift;

              return {
                id: reward._id,
                title: reward.name,
                amount: (reward.minToken && reward.maxToken) ?
                  `${reward.minToken.toLocaleString('fa-IR')} - ${reward.maxToken.toLocaleString('fa-IR')} توکن` :
                  (reward.minToken ? `حداقل ${reward.minToken.toLocaleString('fa-IR')} توکن` : 'متغیر'),
                description: reward.description || '',
                parent: reward.parent,
                minToken: reward.minToken,
                maxToken: reward.maxToken,
                color: `#${reward.color}` || '#59BBAF',
                iconName: reward.icon || "Gift" // ✅ فقط اسم آیکون — نه کامپوننت
              };
            });

          setRewardsFromApi(formattedRewards);
        } else {
          setErrorRewards(rewardsResponse.message || "خطا در دریافت لیست پاداش‌ها.");
        }

        if (userDataResponse.success && userDataResponse.data?.availableTokens !== undefined) {
          setUserCurrentTokens(userDataResponse.data.availableTokens);
        }
      } catch (err) {
        setErrorRewards("خطای شبکه یا سرور: " + (err.message || "خطای ناشناخته"));
      } finally {
        setLoadingRewards(false);
      }
    };

    loadInitialData();
  }, [token]);

  const toggleNotificationPanel = () => setIsNotificationOpen(prev => !prev);
  const closeNotificationPanel = () => setIsNotificationOpen(false);

  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        const notificationIcon = document.getElementById("notification-icon-button");
        if (notificationIcon && notificationIcon.contains(event.target)) return;
        setIsNotificationOpen(false);
      }
    }

    if (isNotificationOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNotificationOpen]);

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
    if (!selectedRewardForRequest || !token) return;

    const requestedTokens = parseInt(requestedTokenAmountStr, 10);
    if (isNaN(requestedTokens) || requestedTokens <= 0) return;

    setSubmittingRewardRequest(true);
    setRewardRequestMessage({ type: '', text: '' });

    try {
      const response = await fetchData('student-reward', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          rewardId: selectedRewardForRequest.id,
          token: requestedTokens
        })
      });

      if (response.success) {
        setRewardRequestMessage({
          type: 'success',
          text: `درخواست برای "${selectedRewardForRequest.title}" با موفقیت ثبت شد.`
        });

        if (userCurrentTokens !== undefined) {
          setUserCurrentTokens(prevTokens => prevTokens - requestedTokens);
        }
      } else {
        setRewardRequestMessage({
          type: 'error',
          text: response.message || "خطا در ثبت درخواست پاداش."
        });
      }
    } catch (err) {
      setRewardRequestMessage({
        type: 'error',
        text: "خطای شبکه یا سرور: " + (err.message || "خطای ناشناخته")
      });
    } finally {
      setSubmittingRewardRequest(false);
    }
  };

  return (
    <>
      <div className={`p-6 md:p-8 flex-col h-screen overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 ${Open ? 'w-full md:w-[calc(100%-22%)]' : 'w-full md:w-[calc(100%-6%)]'
        }`}>
        {/* هدر با دکمه برگشت */}
        <div className="flex flex-col relative sm:flex-row justify-between items-center h-auto sm:h-[5vh] mb-8">
        <button
                onClick={handleGoBack}
                className="flex gap-1 text-gray-400 px-2 py-1 items-center cursor-pointer justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-colors duration-200"
                aria-label="بازگشت به صفحه قبل"
                title="بازگشت"
                style={{position:"absolute",right:0}}
              >
                <IoIosArrowForward className="text-gray-400 text-lg" />
                برگشت

              </button>
          <div className="flex justify-center cursor-pointer items-center gap-3 sm:gap-5 mb-2 sm:mb-0">


            <h3 className="text-[#19A297] text-xs sm:text-sm">هنرستان استارتاپی رکاد</h3>
            <BiSolidSchool className="text-[#19A297] ml-[-8px] sm:ml-[-10px] text-lg sm:text-xl" />

            <div className="relative" ref={notificationRef}>
              {/* دکمه برگشت */}

              <button
                id="notification-icon-button"
                onClick={toggleNotificationPanel}
                className="w-7 h-7 sm:w-8 sm:h-8 flex justify-center items-center border border-gray-300 rounded-full cursor-pointer group relative"
                aria-label="اعلان‌ها"
              >
                <IoNotificationsOutline className="text-gray-400 text-sm sm:text-base" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </button>
              <NotificationPanel
                isOpen={isNotificationOpen}
                onClose={closeNotificationPanel}
                token={token}
              />
            </div>
          </div>

          <div className="flex justify-center items-center mr-25 gap-3 sm:gap-5">
            <p className="text-gray-400 text-xs sm:text-sm">
              امروز {dateInfo.week}، {dateInfo.day} {dateInfo.month}، {dateInfo.year}
            </p>
            <h1 className="text-[#59BBAF] font-semibold text-[22px]">پاداش‌های من</h1>
          </div>

        </div>


        {loadingRewards && (
          <div className="text-center py-10">
            <p className="text-lg text-gray-600">در حال بارگذاری لیست پاداش‌ها...</p>
          </div>
        )}

        {errorRewards && !loadingRewards && (
          <div className="text-center py-10 bg-red-50 p-4 rounded-md">
            <p className="text-lg text-red-600">{errorRewards}</p>
          </div>
        )}

        {!loadingRewards && !errorRewards && rewardsFromApi.length === 0 && (
          <div className="text-center py-10">
            <p className="text-lg text-gray-500">در حال حاضر پاداشی برای درخواست وجود ندارد.</p>
          </div>
        )}

        {!loadingRewards && !errorRewards && rewardsFromApi.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 w-full gap-6 md:gap-8" dir="rtl">
            {rewardsFromApi.map((reward) => {
              console.log("Rendering icon:", reward.iconName); // ✅ فقط برای دیباگ — بعداً پاکش کنید

              return (
                <div
                  key={reward.id}
                  className={`relative py-3 px-5 rounded-xl shadow-lg flex flex-col justify-between text-right h-[140px] sm:min-h-[100px] overflow-hidden border-2 border-transparent hover:border-blue-300 hover:shadow-xl transition-all duration-300 group`}
                >
                  <div
                    style={{ backgroundColor: reward.color }}
                    className="absolute -top-10 -left-10 w-28 h-28 bg-blue-300/30 rounded-full opacity-10 z-0 group-hover:scale-125 transition-transform duration-500"></div>
                  <div
                    style={{ backgroundColor: reward.color }}
                    className="absolute -bottom-8 -right-8 w-36 h-36 bg-blue-300/20 rounded-full opacity-5 z-0 group-hover:scale-110 transition-transform duration-500"></div>

                  <div className="flex justify-between items-start z-10">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-[50%] flex items-center justify-center text-white text-2xl sm:text-3xl shadow-md flex-shrink-0"
                      style={{ backgroundColor: reward.color }}>
                      {/* ✅ Fixed Iconsax Rendering */}
                      <DynamicIcon name={reward.iconName} size={32} variant="Bulk"  />
                    </div>
                    <div className="flex-1 mr-3.5 mt-2">
                      <h3 className="text-base sm:text-sm font-semibold text-blue-800 h-5">{reward.title}</h3>
                      <div className="flex items-center justify-start text-xs sm:text-sm text-blue-700 mb-3">
                        <span className="font-medium">{reward.amount}</span>
                      </div>
                    </div>
                  </div>

                  <div className="z-10 mt-3">
                    <button
                      onClick={() => handleRequestRewardClick(reward)}
                      style={{ backgroundColor: reward.color }}
                      className="w-full text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      ثبت درخواست این پاداش
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="h-16"></div>
      </div>

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