import { useEffect, useState } from "react";
import fetchData from "../../../Utils/fetchData";


const categoryColors = {
  "فعالیت‌های آموزشی": "#652D90",
  "فعالیت‌های داوطلبانه و توسعه فردی": "#E0195B",
  "فعالیت‌های شغلی": "#F8A41D",
  "موارد کسر امتیاز": "#787674",
};

const StudentProfileModal = ({ isOpen, onClose, student, token }) => {
  const [studentDetails, setStudentDetails] = useState(null);
  const [activitiesByCategory, setActivitiesByCategory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"))

  // حالت باز/بسته هر دسته‌بندی
  const [expandedCategories, setExpandedCategories] = useState({});

  useEffect(() => {
    if (isOpen && student && token) {
      fetchStudentDetails();
      fetchStudentActivitiesByCategory();
    }
  }, [isOpen, student, token]);

  const fetchStudentDetails = async () => {
    try {
      setLoading(true);
      const response = await fetchData(`users/${student.id}`, {
        headers: { authorization: `Bearer ${token}` },
      });

      if (response.success) {
        setStudentDetails(response.data);
      } else {
        setError(response.message || "خطا در دریافت اطلاعات دانش‌آموز");
      }
    } catch (err) {
      setError("خطای شبکه یا سرور: " + (err.message || "خطای ناشناخته"));
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentActivitiesByCategory = async () => {
    try {
      const response = await fetchData(
        `users/${student.id}/activities-by-category`,
        {
          headers: { authorization: `Bearer ${token}` },
        }
      );

      if (response.success) {
        setActivitiesByCategory(response.data);
      } else {
        console.error("خطا در دریافت فعالیت‌های دانش‌آموز:", response.message);
      }
    } catch (err) {
      console.error("خطای شبکه در دریافت فعالیت‌ها:", err);
    }
  };

  const toggleCategory = (categoryName) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryName]: !prev[categoryName],
    }));
  };

  const formatNumberToPersian = (num) => {
    if (num === undefined || num === null || isNaN(Number(num))) return "۰";
    return Number(num).toLocaleString("fa-IR");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 rtl bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[#202A5A]">پروفایل دانش‌آموز</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
              &times;
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <p className="text-gray-600">در حال بارگذاری اطلاعات...</p>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center py-8">
              <p className="text-red-500">{error}</p>
            </div>
          ) : studentDetails ? (
            <div className="space-y-6">
              {/* تصویر پروفایل */}
              <div className="flex justify-center">
                {studentDetails.image ? (
                  <img
                    src={studentDetails.image}
                    alt={studentDetails.fullName}
                    className="w-32 h-32 rounded-full object-cover border-4 border-[#19A297]"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-4xl text-gray-400">
                      {studentDetails.fullName?.charAt(0) || "?"}
                    </span>
                  </div>
                )}
              </div>

              {/* اطلاعات اصلی */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">نام کامل</p>
                  <p className="font-semibold text-lg">{studentDetails.fullName || "نامشخص"}</p>
                </div>
                {parseInt(user.idcode) == parseInt(studentDetails.idCode) ? (<div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">کد ملی</p>
                  <p className="font-semibold">{studentDetails.idCode || "نامشخص"}</p>
                </div>) : (<></>)}

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">پایه تحصیلی</p>
                  <p className="font-semibold">{studentDetails.grade || "نامشخص"}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">کلاس</p>
                  <p className="font-semibold">{studentDetails.class || "نامشخص"}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">رشته تحصیلی</p>
                  <p className="font-semibold">{studentDetails.fieldOfStudy || "نامشخص"}</p>
                </div>
                {/* <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">نقش</p>
                  <p className="font-semibold">
                    {studentDetails.role === "student"
                      ? "دانش‌آموز"
                      : studentDetails.role === "admin"
                      ? "مدیر"
                      : studentDetails.role === "superAdmin"
                      ? "سوپرادمین"
                      : "نامشخص"}
                  </p>
                </div> */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">امتیاز کل</p>
                  <p className="font-semibold text-[#19A297]">
                    {formatNumberToPersian(studentDetails.score)}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">توکن</p>
                  <p className="font-semibold text-[#652D90]">
                    {formatNumberToPersian(studentDetails.token)}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">رتبه در مدرسه</p>
                  <p className="font-semibold">
                    {studentDetails.rankInSchool
                      ? formatNumberToPersian(studentDetails.rankInSchool)
                      : "نامشخص"}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">رتبه در پایه</p>
                  <p className="font-semibold">
                    {studentDetails.rankInGrade
                      ? formatNumberToPersian(studentDetails.rankInGrade)
                      : "نامشخص"}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">رتبه در کلاس</p>
                  <p className="font-semibold">
                    {studentDetails.rankInClass
                      ? formatNumberToPersian(studentDetails.rankInClass)
                      : "نامشخص"}
                  </p>
                </div>
              </div>

              {/* بخش جدید: دسته‌بندی‌ها با دراپ‌داون و رنگ‌بندی */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4 text-[#202A5A]">
                  امتیازات بر اساس دسته‌بندی فعالیت‌ها
                </h3>

                {activitiesByCategory.length > 0 ? (
                  activitiesByCategory
                    .sort((a, b) => (a.order || 99) - (b.order || 99))
                    .map((category) => {
                      const bgColor = categoryColors[category.categoryName] || "#f1f1f1";
                      const borderColor = categoryColors[category.categoryName];

                      return (
                        <div key={category.categoryName} className="mb-4">
                          {/* هدر دراپ‌داون با رنگ */}
                          <div
                            className="flex relative justify-items-end rtl items-center p-3 rounded-lg cursor-pointer transition-colors duration-200"
                            style={{ backgroundColor: bgColor, color: "#ffffff" }}
                            onClick={() => toggleCategory(category.categoryName)}
                          >
                            <span className="font-medium">{category.categoryName}</span>
                            <span className="font-bold absolute left-20 text-white">
                              {formatNumberToPersian(category.totalScore)} امتیاز
                            </span>
                            <svg
                              className={`w-5 h-5 transition-transform left-5 absolute duration-200 ${expandedCategories[category.categoryName] ? "rotate-180" : ""
                                }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>

                          {/* محتوای دراپ‌داون با خط مرزی رنگی */}
                          {expandedCategories[category.categoryName] && (
                            <div className="mt-2 space-y-2 pl-6 border-l-2" style={{ borderColor }}>
                              {category.activities.map((activity) => (
                                <div
                                  key={activity._id}
                                  className="bg-gray-50 p-3 rounded-md flex justify-between items-center"
                                >
                                  <div>
                                    <p className="font-medium text-sm">{activity.activityName}</p>
                                    <p className="text-xs text-gray-500 mt-1">{activity.description}</p>
                                  </div>
                                  <span className="font-bold text-[#19A297] text-sm">
                                    {formatNumberToPersian(activity.scoreAwarded)} امتیاز
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                ) : (
                  <div className="col-span-2 text-center py-4 text-gray-500">
                    هیچ فعالیتی برای نمایش وجود ندارد.
                  </div>
                )}
              </div>
              {/* فعالیت‌ها و جوایز */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-[#202A5A]">تعداد فعالیت‌ها</h3>
                  <p className="text-center text-2xl font-bold text-[#19A297]">
                    {studentDetails.activities
                      ? formatNumberToPersian(studentDetails.activities.length)
                      : "۰"}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-[#202A5A]">تعداد جوایز</h3>
                  <p className="text-center text-2xl font-bold text-[#19A297]">
                    {studentDetails.rewards
                      ? formatNumberToPersian(studentDetails.rewards.length)
                      : "۰"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center py-8">
              <p className="text-gray-600">هیچ اطلاعاتی برای نمایش وجود ندارد.</p>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="bg-[#19A297] text-white px-6 py-2 rounded-lg hover:bg-[#14857b] transition-colors"
            >
              بستن
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfileModal;