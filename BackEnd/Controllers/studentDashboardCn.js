// =========================================================================
// کامل فایل کنترلر (مثلاً StudentDashboardCn.js) با تغییرات برای دیباگ
// =========================================================================

import User from '../Models/UserMd.js';
import AdminActivity from '../Models/AdminActivityMd.js';
import StudentActivity from '../Models/StudentActivityMd.js';
import Activity from '../Models/ActivityMd.js'; // مطمئن شو این مدل ایمپورت شده
import StudentReward from '../Models/StudentRewardMd.js';
import catchAsync from '../Utils/catchAsync.js'; // مطمئن شو ابزارهای کمکی ایمپورت شدن
import mongoose from 'mongoose';
// import HandleERROR from '../Utils/handleError.js'; // اگر HandleERROR استفاده میشه، ایمپورتش کن

// ثابت‌هایی که تعریف کرده بودیم
const TARGET_SCORES_BY_PARENT = {
    'فعالیت‌های آموزشی': 1000,
    'فعالیت‌های داوطلبانه و توسعه فردی': 800,
    'فعالیت‌های شغلی': 500,
    'موارد کسر امتیاز': 0,
};

const PARENT_COLORS = {
    'فعالیت‌های آموزشی':                  { text: "text-[#652D90]", rawHexColor: "#652D90" }, // <<<< تغییر از bgColor به rawHexColor
    'فعالیت‌های داوطلبانه و توسعه فردی': { text: "text-[#E0195B]", rawHexColor: "#E0195B" }, // <<<<
    'فعالیت‌های شغلی':                     { text: "text-[#F8A41D]", rawHexColor: "#F8A41D" }, // <<<<
    'موارد کسر امتیاز':                  { text: "text-[#787674]", rawHexColor: "#787674" }, // <<<<
    'default':                            { text: "text-gray-700", rawHexColor: "#A0AEC0" }  // <<<< یک رنگ خاکستری برای پیش‌فرض
};

const DESIRED_PARENT_ORDER = [
    'فعالیت‌های آموزشی',
    'فعالیت‌های داوطلبانه و توسعه فردی',
    'فعالیت‌های شغلی',
    'موارد کسر امتیاز'
];

// تابع کمکی برای محاسبه رتبه
const calculateRank = async (userScore, filter = {}) => {
    // User باید در همین اسکوپ قابل دسترس باشه
    return (await User.countDocuments({ role: 'student', score: { $gt: userScore }, ...filter })) + 1;
};


export const getStudentDashboardData = catchAsync(async (req, res, next) => {
    if (!req.userId) {
        // اگر از HandleERROR استفاده می‌کنی:
        // return next(new HandleERROR("کاربر احراز هویت نشده یا شناسه کاربر یافت نشد.", 401));
        return res.status(401).json({ success: false, message: "کاربر احراز هویت نشده یا شناسه کاربر یافت نشد." });
    }
    const userId = req.userId;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const currentUserData = await User.findById(userObjectId)
                                     .select('fullName score token grade class fieldOfStudy')
                                     .lean();

    if (!currentUserData) {
        // return next(new HandleERROR("اطلاعات کاربر یافت نشد.", 404));
        return res.status(404).json({ success: false, message: "اطلاعات کاربر یافت نشد." });
    }

    const unreadNotificationsCount = 0; // TODO: پیاده‌سازی شمارش اعلان‌های خوانده نشده

    // --- Aggregation Pipelines ---

    // Pipeline برای AdminActivity با دیباگ بیشتر
    const adminActivityScoresPipeline = AdminActivity.aggregate([
        { $match: { userId: userObjectId } },
        {
            $lookup: {
                from: Activity.collection.name, // استفاده از نام کالکشن به صورت داینامیک
                localField: 'activityId',
                foreignField: '_id',
                as: 'activityDetailsJoined'
            }
        },
        { $unwind: { path: '$activityDetailsJoined', preserveNullAndEmptyArrays: true } },
        // { $match: { "activityDetailsJoined.parent": { $exists: true, $ne: null, $ne: "" } } }, // هنوز کامنت برای دیباگ
        // <<<< مرحله دیباگ: نمایش کل داکیومنت بعد از join و unwind
        {
            $project: { // این project فقط برای دیباگ است
                _id: 1,
                scoreAwarded: 1,
                activityIdFromAdminActivity: '$activityId',
                joinedActivityId: '$activityDetailsJoined._id',
                joinedActivityParent: '$activityDetailsJoined.parent',
                joinedActivityName: '$activityDetailsJoined.name'
            }
        }
        // مراحل $group و $project بعدی فعلاً برای این pipeline کامنت شده‌اند
        // { $group: { _id: '$joinedActivityParent', totalScore: { $sum: '$scoreAwarded' } } },
        // { $project: { _id: 0, parentName: '$_id', totalScore: 1 } }
    ]);

    // Pipeline برای StudentActivity با دیباگ بیشتر
    const studentActivityScoresPipeline = StudentActivity.aggregate([
        { $match: { userId: userObjectId, status: 'approved' } },
        {
            $lookup: {
                from: Activity.collection.name, // استفاده از نام کالکشن به صورت داینامیک
                localField: 'activityId',
                foreignField: '_id',
                as: 'activityDetailsJoined'
            }
        },
        { $unwind: { path: '$activityDetailsJoined', preserveNullAndEmptyArrays: true } },
        // { $match: { "activityDetailsJoined.parent": { $exists: true, $ne: null, $ne: "" } } }, // هنوز کامنت برای دیباگ
        // <<<< مرحله دیباگ: نمایش کل داکیومنت بعد از join و unwind
        {
            $project: { // این project فقط برای دیباگ است
                _id: 1,
                scoreAwarded: 1,
                activityIdFromStudentActivity: '$activityId',
                joinedActivityId: '$activityDetailsJoined._id',
                joinedActivityParent: '$activityDetailsJoined.parent',
                joinedActivityName: '$activityDetailsJoined.name'
            }
        }
        // مراحل $group و $project بعدی فعلاً برای این pipeline کامنت شده‌اند
        // { $group: { _id: '$joinedActivityParent', totalScore: { $sum: '$scoreAwarded' } } },
        // { $project: { _id: 0, parentName: '$_id', totalScore: 1 } }
    ]);

    const paidRewardsPipeline = StudentReward.aggregate([
        { $match: { userId: userObjectId, status: 'approved' } },
        { $group: { _id: null, totalTokensSpentOnRewards: { $sum: '$token' } } },
        { $project: { _id: 0, totalTokensSpentOnRewards: 1 } }
    ]);

    const [
        adminActivityResultForDebug, // نام متغیر برای نتیجه دیباگ
        studentActivityResultForDebug, // نام متغیر برای نتیجه دیباگ
        paidRewardsResult
    ] = await Promise.all([
        adminActivityScoresPipeline,
        studentActivityScoresPipeline,
        paidRewardsPipeline
    ]);

    // ---- کنسول لاگ جدید برای دیباگ ----
    console.log("--- DEBUG - DETAILED PIPELINE OUTPUT (Full Controller Code) ---");
    console.log("User ID for Dashboard:", userId);
    console.log("Detailed Admin Activity Data (after join/unwind):", JSON.stringify(adminActivityResultForDebug, null, 2));
    console.log("Detailed Student Activity Data (after join/unwind):", JSON.stringify(studentActivityResultForDebug, null, 2));
    console.log("-----------------------------------------");

    // !!!!!! هشدار دیباگ: بقیه کد با نتایج pipeline های تغییر یافته کار نخواهد کرد.
    // این بخش فقط برای این است که سرور خطا ندهد. activitySummary خالی خواهد بود.
    // بعد از پیدا کردن مشکل، باید این بخش را به حالت اول برگردانید و pipeline ها را اصلاح کنید.
    let adminActivityScoresResult = [];
    if (Array.isArray(adminActivityResultForDebug) && adminActivityResultForDebug.length > 0 && adminActivityResultForDebug[0].hasOwnProperty('joinedActivityParent')) {
         // اگر دیباگ موفق بود و خواستیم به حالت عادی برگردیم، اینجا باید $group و $project را انجام دهیم
         // فعلا برای اینکه کد بعدی کار کند (هرچند با داده غلط)، یک ساختار ساده میسازیم
         const tempAdminGrouped = {};
         adminActivityResultForDebug.forEach(item => {
             if (item.joinedActivityParent) { // فقط اگر parent وجود دارد
                 tempAdminGrouped[item.joinedActivityParent] = (tempAdminGrouped[item.joinedActivityParent] || 0) + (item.scoreAwarded || 0);
             } else { // اگر parent null است، آن را جداگانه جمع کن یا نادیده بگیر
                 tempAdminGrouped['__null_parent__'] = (tempAdminGrouped['__null_parent__'] || 0) + (item.scoreAwarded || 0);
             }
         });
         adminActivityScoresResult = Object.entries(tempAdminGrouped).map(([key, value]) => ({ parentName: key === '__null_parent__' ? null : key, totalScore: value }));
         if(tempAdminGrouped['__null_parent__']) console.log("Admin activities with NULL parent found, total score:", tempAdminGrouped['__null_parent__']);
    }

    let studentActivityScoresResult = [];
    if (Array.isArray(studentActivityResultForDebug) && studentActivityResultForDebug.length > 0 && studentActivityResultForDebug[0].hasOwnProperty('joinedActivityParent')) {
        const tempStudentGrouped = {};
        studentActivityResultForDebug.forEach(item => {
            if (item.joinedActivityParent) {
                tempStudentGrouped[item.joinedActivityParent] = (tempStudentGrouped[item.joinedActivityParent] || 0) + (item.scoreAwarded || 0);
            } else {
                tempStudentGrouped['__null_parent__'] = (tempStudentGrouped['__null_parent__'] || 0) + (item.scoreAwarded || 0);
            }
        });
        studentActivityScoresResult = Object.entries(tempStudentGrouped).map(([key, value]) => ({ parentName: key === '__null_parent__' ? null : key, totalScore: value }));
        if(tempStudentGrouped['__null_parent__']) console.log("Student activities with NULL parent found, total score:", tempStudentGrouped['__null_parent__']);
    }
    // پایان بخش هشدار دیباگ


    // ترکیب امتیازات
    const combinedScoresByParent = {};
    adminActivityScoresResult.filter(item => item.parentName).forEach(item => {
        combinedScoresByParent[item.parentName] = (combinedScoresByParent[item.parentName] || 0) + item.totalScore;
    });
    studentActivityScoresResult.filter(item => item.parentName).forEach(item => {
        combinedScoresByParent[item.parentName] = (combinedScoresByParent[item.parentName] || 0) + item.totalScore;
    });

    console.log("--- Combined Scores By Parent (Before Mapping to Summary) ---");
console.log(JSON.stringify(combinedScoresByParent, null, 2));
    // ساخت و مرتب‌سازی activitySummary
    let activitySummaryByParentUnsorted = Object.entries(combinedScoresByParent).map(([parentName, totalScore]) => {
        const target = TARGET_SCORES_BY_PARENT[parentName] === undefined ? 1 : TARGET_SCORES_BY_PARENT[parentName];
        const progress = totalScore > 0 && target > 0 ? Math.min(Math.round((totalScore / target) * 100), 100) : 0;
        const colors = PARENT_COLORS[parentName] || PARENT_COLORS.default;
        return {
            parentName,
            totalScore,
            progressPercentage: progress,
            color: colors.text,             // کلاس رنگ متن مثل قبل باقی می‌مونه
            rawHexColor: colors.rawHexColor, // <<<< مقدار هگزادسیمال رنگ برای پس‌زمینه
            detailsLink: `/my-activities/${encodeURIComponent(parentName)}`
        };
    });

    const activitySummaryByParentSorted = activitySummaryByParentUnsorted.sort((a, b) => {
        const indexA = DESIRED_PARENT_ORDER.indexOf(a.parentName);
        const indexB = DESIRED_PARENT_ORDER.indexOf(b.parentName);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.parentName.localeCompare(b.parentName, 'fa');
    });

    const paidRewards = (paidRewardsResult.length > 0 && paidRewardsResult[0]) ? paidRewardsResult[0] : { totalTokensSpentOnRewards: 0 };

    // --- رتبه‌بندی ---
    let topStudentsInMyGrade = [];
    if (currentUserData.grade) {
        topStudentsInMyGrade = await User.find({ role: 'student', grade: currentUserData.grade })
            .sort({ score: -1, fullName: 1 })
            .limit(5)
            .select('fullName class score _id')
            .lean();
        topStudentsInMyGrade = topStudentsInMyGrade.map((student, index) => ({
            userId: String(student._id),
            fullName: student.fullName,
            classNum: student.class,
            score: student.score,
            rank: index + 1
        }));
    }

    const userRankInSchool = await calculateRank(currentUserData.score);
    const userRankInGrade = currentUserData.grade ? await calculateRank(currentUserData.score, { grade: currentUserData.grade }) : null;
    const userRankInClass = currentUserData.class ? await calculateRank(currentUserData.score, { grade: currentUserData.grade, class: currentUserData.class }) : null;

    const numberOfNeighbors = 2;

    const higherRankedNeighbors = await User.find({
        role: 'student',
        $or: [
            { score: { $gt: currentUserData.score } },
            { score: currentUserData.score, fullName: { $lt: currentUserData.fullName } }
        ],
        _id: { $ne: userObjectId }
    })
    .sort({ score: 1, fullName: 1 })
    .limit(numberOfNeighbors)
    .select('fullName class score _id')
    .lean();

    const lowerRankedNeighbors = await User.find({
        role: 'student',
        $or: [
            { score: { $lt: currentUserData.score } },
            { score: currentUserData.score, fullName: { $gt: currentUserData.fullName } }
        ],
        _id: { $ne: userObjectId }
    })
    .sort({ score: -1, fullName: -1 })
    .limit(numberOfNeighbors)
    .select('fullName class score _id')
    .lean();

    let combinedRankingList = [
        ...higherRankedNeighbors.reverse(),
        { ...currentUserData, _id: userObjectId, highlight: true, isCurrentUser: true },
        ...lowerRankedNeighbors
    ];

    const uniqueUserIds = new Set();
    const processedRankingTableData = [];

    for (const student of combinedRankingList) {
        if (!student._id) continue;
        const studentIdString = String(student._id);
        if (!uniqueUserIds.has(studentIdString)) {
            const rank = await calculateRank(student.score);
            processedRankingTableData.push({
                rank: rank,
                name: student.fullName,
                code: student.class,
                score: student.score,
                highlight: !!student.isCurrentUser,
                userId: studentIdString
            });
            uniqueUserIds.add(studentIdString);
        }
    }
    processedRankingTableData.sort((a, b) => a.rank - b.rank || a.name.localeCompare(b.name, 'fa'));

    // --- ساخت آبجکت نهایی پاسخ ---
    const dashboardData = {
        headerInfo: {
            schoolName: "هنرستان استارتاپی رکاد",
            userFullName: currentUserData.fullName,
            grade: currentUserData.grade,
            unreadNotificationsCount: unreadNotificationsCount
        },
        totalUserScore: currentUserData.score,
        activitySummary: activitySummaryByParentSorted, // این هنوز به خاطر تغییرات دیباگ خالی خواهد بود
        paidRewardsTokenValue: paidRewards.totalTokensSpentOnRewards,
        availableTokens: currentUserData.token,
        topStudentsInMyGrade: topStudentsInMyGrade,
        userRankingInfo: {
             myRankInSchool: userRankInSchool,
             myRankInGrade: userRankInGrade,
             myRankInClass: userRankInClass,
             myScore: currentUserData.score,
             myClassDisplay: `${currentUserData.grade || ''}${currentUserData.class ? ' - ' + currentUserData.class : ''}`,
             rankingTableData: processedRankingTableData
        }
    };

    res.status(200).json({
        success: true,
        data: dashboardData
    });
});

// اگر تابع calculateRank در فایل دیگری بود، باید آن را ایمپورت کنید
// در غیر این صورت، تعریف بالا کافی است.