// =========================================================================
// RequestRewardPage.jsx (کامل با مودال تعریف شده در داخل - نسخه اصلاح شده)
// =========================================================================
import React, { useState, useEffect, useMemo } from 'react';
import fetchData from '../../../utils/fetchData'; // مسیر صحیح به fetchData
import { BiSolidSchool } from "react-icons/bi";
import { IoClose, IoNotificationsOutline } from "react-icons/io5";
import { FaGraduationCap, FaDollarSign, FaGift, FaLandmark } from "react-icons/fa";
// import { useNavigate } from 'react-router-dom'; // اگر نیاز به هدایت دارید

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
// کامپوننت مودال برای وارد کردن مقدار توکن (تعریف شده در همین فایل)
// ===================================================================================
function RequestRewardTokenModalInternal({ // تغییر نام برای جلوگیری از تداخل با export پیش‌فرض
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
    new Intl.DateTimeFormat('fa-IR', { dateStyle: 'long' }).format(new Date())
  , []);

  useEffect(() => {
    if (isOpen && rewardDetails) {
      setTokenAmount(rewardDetails.minToken ? String(rewardDetails.minToken) : '0');
    }
    if (!isOpen) {
        setTokenAmount('');
    }
  }, [isOpen, rewardDetails]);

  // ---- useEffect برای دیباگ canSubmit (بسیار مهم اگر دکمه دیزیبل می‌مونه) ----
  useEffect(() => {
    if (isOpen && rewardDetails) {
      console.groupCollapsed("--- Modal Submit Button Debug Info ---");
      console.log("isOpen:", isOpen);
      console.log("rewardDetails:", rewardDetails);
      console.log("Current Token Amount in input (state):", tokenAmount, `(Type: ${typeof tokenAmount})`);
      console.log("Is Submitting (prop):", submitting);
      console.log("Reward Min Token:", rewardDetails?.minToken);
      console.log("Reward Max Token:", rewardDetails?.maxToken);
      console.log("User's Current Tokens (from props):", currentUserTokens);

      const numTokenAmount = Number(tokenAmount);
      const isSubmittingFalse = !submitting;
      const isTokenAmountPresent = tokenAmount !== '' && tokenAmount !== null;
      const isTokenAmountPositive = numTokenAmount > 0;
      const isAboveMin = !rewardDetails?.minToken || numTokenAmount >= rewardDetails.minToken;
      const isBelowMax = !rewardDetails?.maxToken || numTokenAmount <= rewardDetails.maxToken;
      const hasEnoughUserTokens = currentUserTokens === undefined || currentUserTokens === null || numTokenAmount <= currentUserTokens;
      const finalCanSubmit = isSubmittingFalse && isTokenAmountPresent && isTokenAmountPositive && isAboveMin && isBelowMax && hasEnoughUserTokens;

      console.log("!submitting:", isSubmittingFalse);
      console.log("tokenAmount present:", isTokenAmountPresent);
      console.log("Number(tokenAmount) > 0:", isTokenAmountPositive);
      console.log(">= minToken:", isAboveMin, `(Val: ${numTokenAmount}, Min: ${rewardDetails?.minToken})`);
      console.log("<= maxToken:", isBelowMax, `(Val: ${numTokenAmount}, Max: ${rewardDetails?.maxToken})`);
      console.log("<= currentUserTokens:", hasEnoughUserTokens, `(Val: ${numTokenAmount}, User: ${currentUserTokens})`);
      console.log("Overall 'canSubmit':", finalCanSubmit);
      console.groupEnd();
    }
  }, [isOpen, rewardDetails, tokenAmount, submitting, currentUserTokens, message]);
  // ---- پایان دیباگ ----


  if (!isOpen || !rewardDetails) return null;

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(tokenAmount); // فقط مقدار توکن (به عنوان رشته) را به والد پاس می‌دهد
    }
  };

  const numTokenAmountForCanSubmit = Number(tokenAmount);
  const canSubmit = !submitting &&
                    tokenAmount !== '' && tokenAmount !== null &&
                    numTokenAmountForCanSubmit > 0 &&
                    (!rewardDetails.minToken || numTokenAmountForCanSubmit >= rewardDetails.minToken) &&
                    (!rewardDetails.maxToken || numTokenAmountForCanSubmit <= rewardDetails.maxToken) &&
                    (currentUserTokens === undefined || currentUserTokens === null || numTokenAmountForCanSubmit <= currentUserTokens);

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
              <label htmlFor="staticTokenInfoModal" className="block text-sm font-medium text-gray-700 mb-1.5 text-right">
                توکن مورد نیاز برای این پاداش
              </label>
              <div id="staticTokenInfoModal" className="p-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-700 text-sm text-center font-medium">
                {rewardDetails.minToken?.toLocaleString('fa-IR') || '۰'}
                {rewardDetails.maxToken && rewardDetails.maxToken !== rewardDetails.minToken ? `  تا  ${rewardDetails.maxToken.toLocaleString('fa-IR')}` : ''}
                {' توکن'}
              </div>
            </div>

            <div>
              <label htmlFor="requestedTokenAmountModal" className="block text-sm font-medium text-gray-700 mb-1.5 text-right">
                مقدار توکنی که می‌خواهید خرج کنید <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="requestedTokenAmountModal" // id تغییر کرد تا با id های احتمالی دیگر تداخل نکند
                name="requestedTokenAmount"
                value={tokenAmount}
                onChange={(e) => setTokenAmount(e.target.value)}
                min={rewardDetails.minToken || 0}
                max={rewardDetails.maxToken || undefined}
                required
                disabled={submitting || message?.type === 'success'}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#19A297] focus:border-[#19A297] text-gray-800 text-sm text-center placeholder-gray-400 appearance-none"
                placeholder={rewardDetails.minToken ? `حداقل ${rewardDetails.minToken.toLocaleString('fa-IR')}` : "مقدار توکن"}
              />
              {currentUserTokens !== undefined && currentUserTokens !== null && (
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
                disabled={submitting && message?.type !== 'success'}
                className="w-full sm:flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2.5 px-4 rounded-lg transition-colors duration-150 disabled:opacity-70"
              >
                {message?.type === 'success' ? 'بستن' : 'انصراف'}
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
