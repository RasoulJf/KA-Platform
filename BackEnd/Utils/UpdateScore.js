import StudentActivity from "../Models/StudentActivityMd.js";
import AdminActivity from "../Models/AdminActivityMd.js";
import StudentReward from "../Models/StudentRewardMd.js";
import updateStudentRankings from "./updateRanks.js";
import HandleERROR from "./handleError.js";

// utils/UpdateScore.js (تابع updateUserScore اصلاح شده)
// utils/UpdateScore.js
export const updateUserScore = async (userInstance) => { // حالا یک نمونه User از قبل fetch شده رو می‌گیره
    let totalScore = 0;

    const studentActivities = await StudentActivity.find({ userId: userInstance._id, status: "approved" });
    const adminActivities = await AdminActivity.find({ userId: userInstance._id });

    studentActivities.forEach(activity => totalScore += (activity.scoreAwarded || 0));
    adminActivities.forEach(activity => totalScore += (activity.scoreAwarded || 0));

    const newActivityIds = [
        ...studentActivities.map(a => a._id),
        ...adminActivities.map(a => a._id)
    ];
    // مقایسه برای جلوگیری از آپدیت غیر ضروری آرایه activities
    const activitiesChanged = !(userInstance.activities.length === newActivityIds.length &&
                               userInstance.activities.every((id, i) => id.equals(newActivityIds[i])));
    if(activitiesChanged) {
        userInstance.activities = newActivityIds;
    }


    const approvedRewards = await StudentReward.find({ userId: userInstance._id, status: "approved" });
    const approvedRewardIds = approvedRewards.map(r => r._id);

    // مقایسه برای جلوگیری از آپدیت غیر ضروری آرایه rewards
    const rewardsChanged = !(userInstance.rewards.length === approvedRewardIds.length &&
                             userInstance.rewards.every((id, i) => id.equals(approvedRewardIds[i])));
    if(rewardsChanged) {
        userInstance.rewards = approvedRewardIds;
    }

    let scoreChanged = false;
    if (userInstance.score !== totalScore) {
        userInstance.score = totalScore;
        scoreChanged = true;
    }


    await updateStudentRankings(); // این باید همیشه اجرا بشه چون ممکنه امتیاز بقیه هم تغییر کرده باشه
    return true;
};




