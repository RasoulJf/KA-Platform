import StudentActivity from "../Models/StudentActivityMd.js";
import AdminActivity from "../Models/AdminActivityMd.js";
import StudentReward from "../Models/StudentRewardMd.js";
import updateStudentRankings from "./updateRanks.js";
import HandleERROR from "./handleError.js";

// utils/UpdateScore.js (تابع updateUserScore اصلاح شده)
// utils/UpdateScore.js
export const updateUserScore = async (userInstance) => { // حالا یک نمونه User از قبل fetch شده رو می‌گیره
    console.log(`UPDATE_USER_SCORE: Started for user ${userInstance.fullName} (${userInstance._id})`);
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
        console.log(`UPDATE_USER_SCORE: User ${userInstance.fullName} activities list updated.`);
    }


    const approvedRewards = await StudentReward.find({ userId: userInstance._id, status: "approved" });
    const approvedRewardIds = approvedRewards.map(r => r._id);

    // مقایسه برای جلوگیری از آپدیت غیر ضروری آرایه rewards
    const rewardsChanged = !(userInstance.rewards.length === approvedRewardIds.length &&
                             userInstance.rewards.every((id, i) => id.equals(approvedRewardIds[i])));
    if(rewardsChanged) {
        userInstance.rewards = approvedRewardIds;
        console.log(`UPDATE_USER_SCORE: User ${userInstance.fullName} rewards list updated.`);
    }

    let scoreChanged = false;
    if (userInstance.score !== totalScore) {
        userInstance.score = totalScore;
        scoreChanged = true;
        console.log(`UPDATE_USER_SCORE: User ${userInstance.fullName} score updated to: ${userInstance.score}.`);
    }

    if (scoreChanged || activitiesChanged || rewardsChanged) {
        console.log(`UPDATE_USER_SCORE: Saving user ${userInstance.fullName} due to changes.`);
        // این save، هوک pre('save') را اجرا می‌کند که token را بر اساس score جدید آپدیت می‌کند
        // (فقط اگر score تغییر کرده باشد یا داکیومنت جدید باشد)
        await userInstance.save();
        console.log(`UPDATE_USER_SCORE: User ${userInstance.fullName} saved. Current token in instance: ${userInstance.token}`);
    } else {
        console.log(`UPDATE_USER_SCORE: No changes in score, activities, or rewards list for user ${userInstance.fullName}. Skipping save.`);
    }

    await updateStudentRankings(); // این باید همیشه اجرا بشه چون ممکنه امتیاز بقیه هم تغییر کرده باشه
    console.log(`UPDATE_USER_SCORE: Finished for user ${userInstance.fullName}`);
    return true;
};




