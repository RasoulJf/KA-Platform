import StudentActivity from "../Models/StudentActivityMd.js";
import AdminActivity from "../Models/AdminActivityMd.js";
import StudentReward from "../Models/StudentRewardMd.js";
import updateStudentRankings from "./updateRanks.js";

export const addScoreToUser = async (user) => {
    let totalScore = 0;

    const activities = await StudentActivity.find({ userId: user._id, status: "approved" });
    const adminActivities = await AdminActivity.find({ userId: user._id });

    activities.forEach(activity => totalScore += activity.scoreAwarded);
    adminActivities.forEach(activity => totalScore += activity.scoreAwarded);

    user.activities = [...activities, ...adminActivities];
    user.score = totalScore;

    await user.save();
    await updateStudentRankings();
};

export const deductTokensFromUser = async (user) => {
    const rewards = await StudentReward.find({ userId: user._id, status: "approved" });

    for (const reward of rewards) {
        if (user.token >= reward.token) {
            user.score -= reward.token;
        } else {
            throw new Error("User does not have enough tokens");
        }
    }

    user.rewards = rewards;
    await user.save();
    await updateStudentRankings();
};