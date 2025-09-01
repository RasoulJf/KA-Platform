// Results.jsx (صفحه نمایش نتایج برای دانش‌آموز)
import React, { useState, useEffect, useMemo } from "react";
import { BiSolidSchool } from "react-icons/bi";
import { IoNotificationsOutline } from "react-icons/io5";
// import { useNavigate } from 'react-router-dom';
import fetchData from "../../Utils/fetchData"; // مسیر صحیح
import { useRef } from "react";
import NotificationPanel from "../../Components/NotificationPanel";

// headerConfig مثل قبل (ترتیب ستون‌ها را چک کنید)
const userString = localStorage.getItem("user");
          console.log(userString)
          const user = userString ? JSON.parse(userString) : null;

const headerConfig = [
  {
    title: "نام و نام‌خانوادگی",
    key: "name",
    headerClass: "bg-gray-100 w-40 text-[#202A5A]",
    cellClass: "text-[#202A5A] whitespace-nowrap border-2 border-solid border-[#F2F2F2] text-[16px]",
  },
  {
    title: "کلاس",
    key: "class",
    headerClass: "bg-gray-100 w-15  text-[#202A5A]",
    cellClass: "text-[#202A5A] w-15 border-2 border-solid border-[#F2F2F2] text-[16px]",
  },
  {
    title: "فعالیت‌های آموزشی",
    key: "educationalActivities",
    headerClass: "bg-[#652D90] w-20 text-white",
    cellClass: "text-[#652D90] w-20 border-2 border-solid border-[#F2F2F2]  text-[16px]",
  },
  {
    title: "فعالیت‌های داوطلبانه و توسعۀ فردی",
    key: "voluntaryActivities",
    headerClass: "bg-[#E0195B] w-35 text-white",
    cellClass: "text-[#E0195B] w-35 border-2 border-solid border-[#F2F2F2] text-[16px]",
  }, // عنوان کوتاه شد
  {
    title: "فعالیت‌های شغلی",
    key: "jobActivities",
    headerClass: "bg-[#F8A41D] w-20 text-white",
    cellClass: "text-[#F8A41D] w-20 text-[16px] border-2 border-solid border-[#F2F2F2]",
  }, // رنگ هدر اصلاح شد
  {
    title: "کسر امتیازات",
    key: "deductions",
    headerClass: "bg-[#787674] w-15 text-white",
    cellClass: "text-[#787674] w-15 text-[16px] border-2 border-solid border-[#F2F2F2]",
  },
  {
    title: "امتیاز کل",
    key: "score",
    headerClass: "bg-gray-100 w-20 text-[#202A5A]",
    cellClass: "text-[#202A5A] w-20 font-bold text-[16px] border-2 border-solid border-[#F2F2F2]",
  },
  {
    title: "رتبه در پایه",
    key: "rank",
    headerClass: "bg-gray-100 w-20 text-[#202A5A]",
    cellClass: "text-[#202A5A] w-20 font-bold text-[16px] border-2 border-solid border-[#F2F2F2]",
  }, // عنوان به "رتبه در پایه" تغییر کرد
].reverse();

export default function StudentResultsPage({ Open }) {
  // نام کامپوننت را واضح‌تر کردم
  const token = localStorage.getItem("token");
  // const navigate = useNavigate();

  const [resultsTableData, setResultsTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResultsCount, setTotalResultsCount] = useState(0);
  const [currentUserInfo, setCurrentUserInfo] = useState(null); // برای نمایش اطلاعات کاربر فعلی
  const [visibility, setVisibility] = useState(false);


  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef(null);

  const refreshUnreadCount = async () => {
    if (!token) return;
    try {
      const response = await fetchData('notifications?filter=unread', {
        headers: { authorization: `Bearer ${token}` }
      });
      if (response.success) {
        setUnreadCount(response.totalCount || 0);
      }
    } catch (error) {
      console.error("Failed to refresh unread count:", error);
    }
  };

  const toggleNotificationPanel = () => setIsNotificationOpen(prev => !prev);
  const closeNotificationPanel = () => {
    setIsNotificationOpen(false);
    refreshUnreadCount(); // این خط را برای اطمینان از به‌روز بودن عدد اضافه کنید
  };
  // <<< تغییر: ۲. دریافت اطلاعات هدر و تعداد اعلان‌ها
  useEffect(() => {
    refreshUnreadCount(); // این خط را برای اطمینان از به‌روز بودن عدد اضافه کنید

  }, [token]);

  // <<< تغییر: ۳. منطق بستن پنل با کلیک بیرون
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        const notificationIcon = document.getElementById("notification-icon-button-results"); // آیدی یکتا
        if (notificationIcon && notificationIcon.contains(event.target)) return;
        setIsNotificationOpen(false);
      }
    }
    if (isNotificationOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNotificationOpen]);


  const date = new Date();
  const year = new Intl.DateTimeFormat("fa-IR", { year: "numeric" }).format(
    date
  );
  const month = new Intl.DateTimeFormat("fa-IR", { month: "long" }).format(
    date
  );
  const day = new Intl.DateTimeFormat("fa-IR", { day: "numeric" }).format(date);
  const week = new Intl.DateTimeFormat("fa-IR", { weekday: "long" }).format(
    date
  );

  const formatNumberToPersian = (num) => {
    if (num === undefined || num === null || isNaN(Number(num))) return "۰";
    if (num < 0) return `(${Math.abs(num).toLocaleString("fa-IR")}-)`; // نمایش منفی
    return Number(num).toLocaleString("fa-IR");
  };

  useEffect(() => {
    const fetchMyGradeResults = async (page = 1) => {
      if (!token) {
        setError("توکن احراز هویت یافت نشد. لطفاً دوباره وارد شوید.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        // درخواست به اندپوینت جدید که فقط هم‌پایه‌ای‌ها را برمی‌گرداند
        const response = await fetchData(
          `users/my-grade-rankings?page=${page}&limit=10`,
          {
            headers: { authorization: `Bearer ${token}` },
          }
        );

        console.log(
          "--- StudentResultsPage - Data from API (my-grade-rankings) ---"
        );
        console.log(
          "Raw response from backend:",
          JSON.stringify(response, null, 2)
        );

        if (response.success && Array.isArray(response.data)) {
          const formattedData = response.data.map((item) => ({
            ...item,
            educationalActivities: formatNumberToPersian(
              item.educationalActivities
            ),
            voluntaryActivities: formatNumberToPersian(
              item.voluntaryActivities
            ),
            jobActivities: formatNumberToPersian(item.jobActivities),
            deductions: (item.deductions), // کسر امتیاز نمایش داده می‌شود
            score: formatNumberToPersian(item.score),
            rank: formatNumberToPersian(item.rank),
          }));
          console.log(formatNumberToPersian(formattedData))

          setResultsTableData(formattedData);
          console.log(formattedData)
          setCurrentPage(page);
          setTotalResultsCount(response.totalCount || 0);
          setTotalPages(Math.ceil((response.totalCount || 0) / 15));

          // پیدا کردن و ذخیره اطلاعات کاربر فعلی از لیست (اگر وجود دارد)
          const userString = localStorage.getItem("user");
          console.log(userString)
          const user = userString ? JSON.parse(userString) : null; // فرض می‌کنیم userId در localStorage ذخیره شده
          console.log(user.id)
          const foundUser = response.data.find(
            (user) => user.id === user.id
          );
          if (foundUser) setCurrentUserInfo(foundUser);
          console.log(currentUserInfo)
        } else {
          setError(response.message || "خطا در دریافت نتایج هم‌پایه‌ای‌ها.");
          setResultsTableData([]);
        }
      } catch (err) {
        setError("خطای شبکه یا سرور: " + (err.message || "خطای ناشناخته"));
        setResultsTableData([]);
      } finally {
        setLoading(false);
        setTimeout(() => {
          setVisibility(true)
        }, 200);
      }
    };

    fetchMyGradeResults(currentPage);
  }, [currentPage, token]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && !loading) {
      setCurrentPage(newPage);
    }
  };

  if (loading && resultsTableData.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <p className="text-xl text-gray-600">در حال بارگذاری نتایج...</p>
      </div>
    );
  }
  if (error && resultsTableData.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-screen w-full p-6 text-center">
        <p className="text-xl text-red-500 mb-4">خطا: {error}</p>
        <button
          onClick={() => fetchMyGradeResults(1)}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  return (
    <>
      <div
        className={`${!visibility ? "hidden opacity-0" : ""} p-6 md:p-8 transition-all duration-500 flex-col h-screen overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 ${!Open ? "w-[calc(100%-6%)]" : "w-[calc(100%-22%)]"
          }`}
      >
        {/* هدر بالا */}
        <div className="flex flex-col sm:flex-row justify-between items-center h-auto sm:h-[5vh] mb-6">
          <div className="flex justify-center items-center gap-3 sm:gap-5 mb-2 sm:mb-0">
            <h3 className="text-[#19A297] text-xs sm:text-sm">
              هنرستان استارتاپی رکاد
            </h3>
            <BiSolidSchool className="text-[#19A297] ml-[-8px] sm:ml-[-10px] text-lg sm:text-xl" />
            {/* <<< تغییر: ۴. جایگزینی دکمه نوتیفیکیشن با کد جدید */}
            <div className="relative" ref={notificationRef}>
              <button
                id="notification-icon-button"
                onClick={toggleNotificationPanel}
                className="w-7 h-7 sm:w-8 sm:h-8 flex justify-center items-center border border-gray-300 rounded-full cursor-pointer group relative"
                aria-label="اعلان‌ها"
              >
                <IoNotificationsOutline className="text-gray-400 text-sm sm:text-base" />
                {unreadCount > 0 && ( // <<<< اینجا از unreadCount استفاده می‌کنیم
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
          <div className="flex justify-center items-center gap-3 sm:gap-5">
            <p className="text-gray-400 text-xs sm:text-sm">
              امروز {week}، {day} {month} {year}
            </p>
            <h1 className="text-[#59BBAF] font-semibold text-[22px] mr-1">
              جدول امتیازات
            </h1>
          </div>
        </div>

        {/* نمایش پیام‌های لودینگ و خطا در حین آپدیت جدول */}
        {loading && resultsTableData.length > 0 && (
          <p className="text-center text-sm text-gray-500 py-2">
            در حال به‌روزرسانی جدول...
          </p>
        )}
        {error && resultsTableData.length > 0 && !loading && (
          <p className="text-center text-sm text-red-500 py-2">خطا: {error}</p>
        )}

        {/* (اختیاری) نمایش رتبه و امتیاز خود کاربر در بالا */}
        {/* {currentUserInfo && (
          <div className="mb-6 p-4 bg-indigo-50 rounded-lg shadow text-center">
            <p className="text-indigo-700">
              شما، <span className="font-semibold">{currentUserInfo.name}</span>
              ، با امتیاز{" "}
              <span className="font-semibold">
                {formatNumberToPersian(currentUserInfo.score)}
              </span>
              ، رتبه{" "}
              <span className="font-semibold">
                {formatNumberToPersian(currentUserInfo.rank)}
              </span>{" "}
              را در پایه خود دارید.
            </p>
          </div>
        )} */}

        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[100%] text-sm">
              <thead className="text-xs uppercase sticky top-0 z-10">
                {" "}
                {/* هدر چسبان */}
                <tr className="h-15">
                  {headerConfig.map((header) => (
                    <th
                      key={header.key}
                      scope="col"
                      className={`py-3 font-semibold text-center ${header.headerClass}`}
                    >
                      {" "}
                      {/* کاهش padding */}
                      {header.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {resultsTableData.length > 0
                  ? resultsTableData.map((row, idx) => (
                    <tr
                      key={row.id || idx}
                      className={`${ row.id==user.id ? "bg-[#D4F3F1] " : ""}${idx % 2 === 0 && !row.id==user.id ? "bg-white" : !row.id==user.id ? "bg-gray-50/60 " :""
                        } hover:bg-indigo-50/50 transition-colors text-xs`}
                    >
                      {" "}
                      {/* کاهش سایز فونت */}
                      {headerConfig.map((header) => (
                        <td
                          key={`${row.id || idx}-${header.key}`}
                          className={`h-15 py-2.5 font-[600] text-center ${header.cellClass}`}
                        >
                          {" "}
                          {/* کاهش padding */}
                          {row[header.key]}
                        </td>
                      ))}
                    </tr>
                  ))
                  : !loading && (
                    <tr>
                      <td
                        colSpan={headerConfig.length}
                        className="text-center py-10 text-gray-500"
                      >
                        دانش‌آموزی در این پایه برای نمایش وجود ندارد.
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>
        </div>

        {/* صفحه‌بندی */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-1 sm:space-x-2 space-x-reverse mt-6 mb-8">
            {" "}
            {/* کاهش فاصله */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              className="px-3 py-1.5 text-xs sm:text-sm bg-gray-200 hover:bg-gray-300 rounded-md disabled:opacity-50"
            >
              {" "}
              قبلی{" "}
            </button>
            {/* منطق نمایش شماره صفحات با ... */}
            {[...Array(totalPages).keys()].map((num) => {
              const pageNum = num + 1;
              if (
                totalPages <= 5 ||
                pageNum === 1 ||
                pageNum === totalPages ||
                Math.abs(pageNum - currentPage) <= 1 ||
                (currentPage <= 2 && pageNum <= 3) ||
                (currentPage >= totalPages - 1 && pageNum >= totalPages - 2)
              ) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    disabled={loading}
                    className={`px-3 py-1.5 text-xs sm:text-sm rounded-md ${currentPage === pageNum
                      ? "bg-[#19A297] text-white"
                      : "bg-white hover:bg-gray-100 border"
                      }`}
                  >
                    {" "}
                    {pageNum.toLocaleString("fa-IR")}{" "}
                  </button>
                );
              } else if (
                (currentPage > 3 && pageNum === 2) ||
                (currentPage < totalPages - 2 && pageNum === totalPages - 1)
              ) {
                return (
                  <span
                    key={pageNum}
                    className="px-1 sm:px-2 py-1.5 text-xs sm:text-sm"
                  >
                    ...
                  </span>
                );
              }
              return null;
            })}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
              className="px-3 py-1.5 text-xs sm:text-sm bg-gray-200 hover:bg-gray-300 rounded-md disabled:opacity-50"
            >
              {" "}
              بعدی{" "}
            </button>
            <span className="text-xs text-gray-600 hidden sm:inline">
              {" "}
              صفحه {currentPage.toLocaleString("fa-IR")} از{" "}
              {totalPages.toLocaleString("fa-IR")} (کل:{" "}
              {totalResultsCount.toLocaleString("fa-IR")}){" "}
            </span>
          </div>
        )}
        <div className="h-16"></div>
      </div>
    </>
  );
}
