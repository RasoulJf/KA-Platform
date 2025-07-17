import User from '../Models/UserMd.js';
import AdminActivity from '../Models/AdminActivityMd.js';
import StudentActivity from '../Models/StudentActivityMd.js';
import Activity from '../Models/ActivityMd.js';
import StudentReward from '../Models/StudentRewardMd.js';
import catchAsync from '../Utils/catchAsync.js';
import mongoose from 'mongoose';

const TARGET_SCORES_BY_PARENT = { 'فعالیت‌های آموزشی': 1000, 'فعالیت‌های داوطلبانه و توسعه فردی': 800, 'فعالیت‌های شغلی': 500, 'موارد کسر امتیاز': 0 };
const PARENT_COLORS = { 'فعالیت‌های آموزشی': { text: "text-[#652D90]", rawHexColor: "#652D90" }, 'فعالیت‌های داوطلبانه و توسعه فردی': { text: "text-[#E0195B]", rawHexColor: "#E0195B" }, 'فعالیت‌های شغلی': { text: "text-[#F8A41D]", rawHexColor: "#F8A41D" }, 'موارد کسر امتیاز': { text: "text-[#787674]", rawHexColor: "#787674" }, 'default': { text: "text-gray-700", rawHexColor: "#A0AEC0" } };
const DESIRED_PARENT_ORDER = [ 'فعالیت‌های آموزشی', 'فعالیت‌های داوطلبانه و توسعه فردی', 'فعالیت‌های شغلی', 'موارد کسر امتیاز' ];

const calculateRank = async (userScore, filter = {}) => {
    if (userScore === null || typeof userScore === 'undefined') return null;
    return (await User.countDocuments({ role: 'student', score: { $gt: userScore }, ...filter })) + 1;
};

export const getStudentDashboardData = catchAsync(async (req, res, next) => {
    if (!req.userId) return res.status(401).json({ success: false, message: "کاربر احراز هویت نشده است." });
    
    const userObjectId = new mongoose.Types.ObjectId(req.userId);
    const currentUserData = await User.findById(userObjectId).select('fullName score token grade class').lean();
    if (!currentUserData) return res.status(404).json({ success: false, message: "اطلاعات کاربر یافت نشد." });

    const [adminScores, studentScores, paidRewardsResult, topStudents, higherNeighbors, lowerNeighbors] = await Promise.all([
        AdminActivity.aggregate([
            { $match: { userId: userObjectId } }, { $lookup: { from: 'activities', localField: 'activityId', foreignField: '_id', as: 'activityDetails' } }, { $unwind: "$activityDetails" }, { $match: { "activityDetails.parent": { $exists: true, $ne: null } } }, { $group: { _id: "$activityDetails.parent", totalScore: { $sum: "$scoreAwarded" } } }
        ]),
        StudentActivity.aggregate([
            { $match: { userId: userObjectId, status: 'approved' } }, { $lookup: { from: 'activities', localField: 'activityId', foreignField: '_id', as: 'activityDetails' } }, { $unwind: "$activityDetails" }, { $match: { "activityDetails.parent": { $exists: true, $ne: null } } }, { $group: { _id: "$activityDetails.parent", totalScore: { $sum: "$scoreAwarded" } } }
        ]),
        StudentReward.aggregate([
            { $match: { userId: userObjectId, status: 'approved' } }, { $group: { _id: null, totalTokensSpentOnRewards: { $sum: '$token' } } }
        ]),
        currentUserData.grade ? User.find({ role: 'student', grade: currentUserData.grade }).sort({ score: -1, fullName: 1 }).limit(5).select('fullName class score _id').lean() : Promise.resolve([]),
        User.find({ role: 'student', score: { $gt: currentUserData.score } }).sort({ score: 1 }).limit(2).select('fullName class score _id').lean(),
        User.find({ role: 'student', score: { $lt: currentUserData.score } }).sort({ score: -1 }).limit(2).select('fullName class score _id').lean()
    ]);
    
    const combinedScores = {};
    adminScores.forEach(item => combinedScores[item._id] = (combinedScores[item._id] || 0) + item.totalScore);
    studentScores.forEach(item => combinedScores[item._id] = (combinedScores[item._id] || 0) + item.totalScore);

    const activitySummary = Object.entries(combinedScores).map(([parentName, totalScore]) => {
        const colors = PARENT_COLORS[parentName] || PARENT_COLORS.default;
        return { parentName, totalScore, progressPercentage: Math.min(Math.round((totalScore / (TARGET_SCORES_BY_PARENT[parentName] || 1)) * 100), 100), color: colors.text, rawHexColor: colors.rawHexColor };
    }).sort((a,b) => DESIRED_PARENT_ORDER.indexOf(a.parentName) - DESIRED_PARENT_ORDER.indexOf(b.parentName));

    const paidRewards = paidRewardsResult[0] || { totalTokensSpentOnRewards: 0 };
    const topStudentsInMyGrade = topStudents.map((s, i) => ({ ...s, rank: i + 1, userId: String(s._id) }));
    
    const userRankInSchool = await calculateRank(currentUserData.score);
    const userRankInGrade = currentUserData.grade ? await calculateRank(currentUserData.score, { grade: currentUserData.grade }) : null;
    const userRankInClass = currentUserData.class ? await calculateRank(currentUserData.score, { grade: currentUserData.grade, class: currentUserData.class }) : null;
    
    let combinedRankingList = [...higherNeighbors.reverse(), { ...currentUserData, highlight: true }, ...lowerNeighbors];
    const rankingTableData = await Promise.all(combinedRankingList.map(async (s) => ({
        userId: String(s._id), name: s.fullName, code: s.class || 'N/A', score: s.score, highlight: !!s.highlight, rank: await calculateRank(s.score)
    })));

    res.status(200).json({
        success: true,
        data: {
            headerInfo: { schoolName: "هنرستان استارتاپی رکاد", userFullName: currentUserData.fullName, grade: currentUserData.grade, unreadNotificationsCount: 0 },
            totalUserScore: currentUserData.score,
            activitySummary,
            paidRewardsTokenValue: paidRewards.totalTokensSpentOnRewards,
            availableTokens: currentUserData.token,
            topStudentsInMyGrade,
            // ✅✅✅ FIX نهایی و قطعی ✅✅✅
            userRankingInfo: {
                myRankInSchool: userRankInSchool,
                myRankInGrade: userRankInGrade,
                myRankInClass: userRankInClass,
                rankingTableData: rankingTableData
            }
        }
    });
});