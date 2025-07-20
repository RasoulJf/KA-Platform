// dashboardController.js

import StudentActivity from "../Models/StudentActivityMd.js";
import StudentReward from "../Models/StudentRewardMd.js";
import User from "../Models/UserMd.js";
import catchAsync from "../Utils/catchAsync.js";

// Controllers/dashboardController.js



/**
 * @desc    Get a combined & sorted list of recent pending activity and reward requests
 * @route   GET /api/dashboard/recent-pending-requests
 * @access  Private (Admin)
 */
export const getRecentPendingRequests = catchAsync(async (req, res, next) => {
    const limit = parseInt(req.query.limit, 10) || 10; // دریافت ۱۰ مورد به صورت پیش‌فرض

    const pipeline = [
        // مرحله ۱: هر دو کالکشن را با فیلدهای یکسان پروژه می‌کنیم
        {
            $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                as: 'userInfo'
            }
        },
        { $unwind: '$userInfo' },
        
        // این $project باید در هر دو بخش union یکسان باشد
        {
            $project: {
                _id: 1,
                requestType: '$requestType', // فیلد نوع درخواست که در مراحل بعد اضافه می‌کنیم
                entityId: '$entityId',     // آیدی داکیومنت اصلی (activityId یا rewardId)
                entityName: '$entityName', // نام فعالیت یا پاداش
                userId: '$userInfo._id',
                userFullName: '$userInfo.fullName',
                createdAt: 1, // برای مرتب‌سازی
            }
        },

        // مرحله نهایی: مرتب‌سازی و محدود کردن
        { $sort: { createdAt: -1 } }, // مرتب‌سازی بر اساس جدیدترین
        { $limit: limit }
    ];
    
    // پایپ‌لاین برای StudentActivity
    const activityPipeline = [
        { $match: { status: 'pending' } },
        { $addFields: { requestType: 'activity' } }, // اضافه کردن نوع
        {
            $lookup: {
                from: 'activities', // نام کالکشن فعالیت‌ها
                localField: 'activityId',
                foreignField: '_id',
                as: 'entityInfo'
            }
        },
        { $unwind: { path: '$entityInfo', preserveNullAndEmptyArrays: true } },
        {
            $project: {
                _id: 1,
                userId: 1,
                createdAt: 1,
                requestType: 1,
                entityId: '$activityId',
                entityName: '$entityInfo.name'
            }
        },
        ...pipeline // اعمال مراحل مشترک lookup کاربر و ...
    ];

    // پایپ‌لاین برای StudentReward
    const rewardPipeline = [
        { $match: { status: 'pending' } },
        { $addFields: { requestType: 'reward' } }, // اضافه کردن نوع
        {
            $lookup: {
                from: 'rewards', // نام کالکشن پاداش‌ها
                localField: 'rewardId',
                foreignField: '_id',
                as: 'entityInfo'
            }
        },
        { $unwind: { path: '$entityInfo', preserveNullAndEmptyArrays: true } },
        {
            $project: {
                _id: 1,
                userId: 1,
                createdAt: 1,
                requestType: 1,
                entityId: '$rewardId',
                entityName: '$entityInfo.name'
            }
        },
        ...pipeline // اعمال مراحل مشترک lookup کاربر و ...
    ];


    // اجرای دو پایپ‌لاین و ترکیب نتایج
    const [activityRequests, rewardRequests] = await Promise.all([
        StudentActivity.aggregate(activityPipeline),
        StudentReward.aggregate(rewardPipeline)
    ]);
    
    // ترکیب و مرتب سازی نهایی در کد
    let combinedResults = [...activityRequests, ...rewardRequests];
    combinedResults.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // محدود کردن به تعداد limit
    const finalResults = combinedResults.slice(0, limit);

    res.status(200).json({
        success: true,
        data: finalResults
    });
});


export const getDashboardSummary = catchAsync(async (req, res, next) => {
  // --- ۱. اطلاعات از مدل User (بدون تغییر) ---
  const userStatsPipeline = User.aggregate([
    // ... (کد شما برای این بخش کاملاً صحیح و بدون تغییر است) ...
    { $match: { role: 'student' } },
    {
      $facet: {
        "overallStats": [
          { $group: { _id: null, totalScore: { $sum: '$score' }, availableTokens: { $sum: '$token' }, totalStudents: { $sum: 1 } } },
          { $project: { _id: 0 } }
        ],
        "averageScoresByGrade": [
          { $group: { _id: '$grade', averageScore: { $avg: '$score' }, studentCount: { $sum: 1 } } },
          { $project: { _id: 0, grade: '$_id', averageScore: { $round: ['$averageScore', 1] }, studentCount: 1 } }
        ]
      }
    },
    {
      $project: {
        totalScore: { $ifNull: [{ $arrayElemAt: ["$overallStats.totalScore", 0] }, 0] },
        availableTokens: { $ifNull: [{ $arrayElemAt: ["$overallStats.availableTokens", 0] }, 0] },
        totalStudents: { $ifNull: [{ $arrayElemAt: ["$overallStats.totalStudents", 0] }, 0] },
        averageScores: "$averageScoresByGrade"
      }
    }
  ]);

  // --- ۲. اطلاعات از StudentActivity (درخواست‌های فعالیت - بدون تغییر) ---
  const activityRequestSummaryPipeline = StudentActivity.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $group: { _id: null, statuses: { $push: { status: '$_id', count: '$count' } } } },
    {
      $project: {
        _id: 0,
        approvedRequestsCount: { $ifNull: [{ $arrayElemAt: [{ $filter: { input: '$statuses', as: 's', cond: { $eq: ['$$s.status', 'approved'] } } }, 0] }, { count: 0 }] },
        pendingRequestsCount: { $ifNull: [{ $arrayElemAt: [{ $filter: { input: '$statuses', as: 's', cond: { $eq: ['$$s.status', 'pending'] } } }, 0] }, { count: 0 }] },
      }
    },
    { $project: { approvedRequestsCount: '$approvedRequestsCount.count', pendingRequestsCount: '$pendingRequestsCount.count' } }
  ]);

  // --- ۳. اطلاعات از StudentReward (پاداش‌های دانش‌آموزان) ---
  const rewardUsageSummaryPipeline = StudentReward.aggregate([
    // <<< تغییر ۱: به جای match کردن فقط تایید شده‌ها، همه را group می‌کنیم >>>
    {
        $facet: {
            "approvedStats": [
                { $match: { status: 'approved' } },
                { $group: { _id: null, totalTokensSpent: { $sum: '$token' }, approvedRewardsCount: { $sum: 1 } } }
            ],
            "pendingStats": [
                { $match: { status: 'pending' } },
                { $group: { _id: null, pendingRewardsCount: { $sum: 1 } } }
            ]
        }
    },
    {
        $project: {
            _id: 0,
            usedTokens: { $ifNull: [{ $arrayElemAt: ["$approvedStats.totalTokensSpent", 0] }, 0] },
            paidRewardsCount: { $ifNull: [{ $arrayElemAt: ["$approvedStats.approvedRewardsCount", 0] }, 0] },
            pendingRewardsCount: { $ifNull: [{ $arrayElemAt: ["$pendingStats.pendingRewardsCount", 0] }, 0] }
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

  // استخراج نتایج
  const userStats = (userSummaryResult.length > 0) ? userSummaryResult[0] : { totalScore: 0, availableTokens: 0, totalStudents: 0, averageScores: [] };
  const activityStats = (activityRequestSummaryResult.length > 0) ? activityRequestSummaryResult[0] : { approvedRequestsCount: 0, pendingRequestsCount: 0 };
  const rewardStats = (rewardUsageSummaryResult.length > 0) ? rewardUsageSummaryResult[0] : { usedTokens: 0, paidRewardsCount: 0, pendingRewardsCount: 0 }; // <<< pendingRewardsCount اضافه شد

  // تبدیل آرایه averageScores به آبجکت (بدون تغییر)
  const averageScoresMap = {};
  (userStats.averageScores || []).forEach(item => {
    if (item.grade) {
        averageScoresMap[`avgScore${item.grade}`] = item.averageScore;
    }
  });

  // تجمیع نتایج نهایی
  const summaryData = {
    totalScore: userStats.totalScore,
    availableTokens: userStats.availableTokens, // توکن خام قبل از کسر
    totalStudents: userStats.totalStudents,
    approvedRequestsCount: activityStats.approvedRequestsCount,
    // <<< تغییر ۲: جمع کردن تعداد درخواست‌های در انتظار از هر دو نوع >>>
    pendingRequestsCount: (activityStats.pendingRequestsCount || 0) + (rewardStats.pendingRewardsCount || 0),
    usedTokens: rewardStats.usedTokens,
    paidRewardsCount: rewardStats.paidRewardsCount,
    ...averageScoresMap,
  };

  res.status(200).json({
    success: true,
    data: summaryData
  });
});