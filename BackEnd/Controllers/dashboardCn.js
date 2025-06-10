// در dashboardController.js

import StudentActivity from "../Models/StudentActivityMd.js";
import StudentReward from "../Models/StudentRewardMd.js";
import User from "../Models/UserMd.js";
import catchAsync from "../Utils/catchAsync.js";




export const getDashboardSummary = catchAsync(async (req, res, next) => {
  // --- 1. اطلاعات از مدل User (فقط دانش‌آموزان) ---
  const userStatsPipeline = User.aggregate([
    {
      $match: { role: 'student' }
    },
    {
      $facet: { // اجرای چند پایپ‌لاین موازی روی داده‌های match شده
        "overallStats": [
          {
            $group: {
              _id: null,
              totalScore: { $sum: '$score' },
              availableTokens: { $sum: '$token' },
              totalStudents: { $sum: 1 }
            }
          },
          { $project: { _id: 0 } }
        ],
        "averageScoresByGrade": [
          {
            $group: {
              _id: '$grade', // گروه بندی بر اساس پایه
              averageScore: { $avg: '$score' },
              studentCount: { $sum: 1 } // تعداد دانش‌آموزان در هر پایه
            }
          },
          {
            $project: { // تغییر نام _id به grade برای خوانایی بهتر
              _id: 0,
              grade: '$_id',
              averageScore: { $round: ['$averageScore', 1] }, // گرد کردن به یک رقم اعشار
              studentCount: 1
            }
          }
        ]
      }
    },
    { // تبدیل نتایج $facet به یک آبجکت واحد
      $project: {
        totalScore: { $ifNull: [{ $arrayElemAt: ["$overallStats.totalScore", 0] }, 0] },
        availableTokens: { $ifNull: [{ $arrayElemAt: ["$overallStats.availableTokens", 0] }, 0] },
        totalStudents: { $ifNull: [{ $arrayElemAt: ["$overallStats.totalStudents", 0] }, 0] },
        averageScores: "$averageScoresByGrade" // این یک آرایه از {grade, averageScore, studentCount} خواهد بود
      }
    }
  ]);

  // --- 2. اطلاعات از StudentActivity (درخواست‌ها) ---
  const activityRequestSummaryPipeline = StudentActivity.aggregate([
    // ... (بدون تغییر، همانطور که قبلاً بود) ...
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: null,
        statuses: { $push: { status: '$_id', count: '$count' } }
      }
    },
    {
      $project: {
        _id: 0,
        approvedRequestsCount: {
          $ifNull: [
            { $arrayElemAt: [{ $filter: { input: '$statuses', as: 's', cond: { $eq: ['$$s.status', 'approved'] } } }, 0] },
            { count: 0 }
          ]
        },
        pendingRequestsCount: {
          $ifNull: [
            { $arrayElemAt: [{ $filter: { input: '$statuses', as: 's', cond: { $eq: ['$$s.status', 'pending'] } } }, 0] },
            { count: 0 }
          ]
        },
      }
    },
    {
        $project: {
            approvedRequestsCount: '$approvedRequestsCount.count',
            pendingRequestsCount: '$pendingRequestsCount.count',
        }
    }
  ]);

  // --- 3. اطلاعات از StudentReward (پاداش‌های دانش‌آموزان) ---
  const rewardUsageSummaryPipeline = StudentReward.aggregate([
    // ... (بدون تغییر، همانطور که قبلاً بود) ...
    {
      $match: { status: 'approved' }
    },
    {
      $group: {
        _id: null,
        totalTokensSpent: { $sum: '$token' },
        approvedRewardsCount: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        usedTokens: '$totalTokensSpent',
        paidRewardsCount: '$approvedRewardsCount'
      }
    }
  ]);

  // اجرای همزمان تمام پایپ‌لاین‌ها
  const [
    userSummaryResult,
    activityRequestSummaryResult,
    rewardUsageSummaryResult
  ] = await Promise.all([
    userStatsPipeline,
    activityRequestSummaryPipeline,
    rewardUsageSummaryPipeline
  ]);

  // استخراج نتایج (هر نتیجه یک آرایه است، معمولاً با یک عضو)
  const userStats = (userSummaryResult.length > 0) ? userSummaryResult[0] : { totalScore: 0, availableTokens: 0, totalStudents: 0, averageScores: [] };
  const activityStats = (activityRequestSummaryResult.length > 0) ? activityRequestSummaryResult[0] : { approvedRequestsCount: 0, pendingRequestsCount: 0 };
  const rewardStats = (rewardUsageSummaryResult.length > 0) ? rewardUsageSummaryResult[0] : { usedTokens: 0, paidRewardsCount: 0 };

  // تبدیل آرایه averageScores به یک آبجکت برای دسترسی راحت‌تر در فرانت‌اند
  const averageScoresMap = {};
  (userStats.averageScores || []).forEach(item => {
    if (item.grade) { // اطمینان از وجود نام پایه
        averageScoresMap[`avgScore${item.grade}`] = item.averageScore;
    }
  });


  // تجمیع نتایج نهایی
  const summaryData = {
    totalScore: userStats.totalScore,
    availableTokens: userStats.availableTokens - rewardStats.usedTokens, // اصلاح شده برای توکن واقعی قابل استفاده
    totalStudents: userStats.totalStudents,
    approvedRequestsCount: activityStats.approvedRequestsCount,
    pendingRequestsCount: activityStats.pendingRequestsCount,
    usedTokens: rewardStats.usedTokens,
    paidRewardsCount: rewardStats.paidRewardsCount,
    ...averageScoresMap, // اضافه کردن میانگین امتیازات به صورت avgScoreدهم، avgScoreیازدهم و ...
  };

  res.status(200).json({
    success: true,
    data: summaryData
  });
});


