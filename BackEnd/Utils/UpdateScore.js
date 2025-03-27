import StudentActivity from "../Models/StudentActivityMd.js";
import AdminActivity from "../Models/AdminActivityMd.js";
import StudentReward from "../Models/StudentRewardMd.js";
import updateStudentRankings from "./updateRanks.js";
import HandleERROR from "./handleError.js";

export const updateUserScore = async (user) => {
    let totalScore = 0;

    const activities = await StudentActivity.find({ userId: user._id, status: "approved" });
    const adminActivities = await AdminActivity.find({ userId: user._id });
    
    activities.forEach(activity => totalScore += activity.scoreAwarded);
    adminActivities.forEach(activity => totalScore += activity.scoreAwarded);

    user.activities = [...activities, ...adminActivities];
    user.score = totalScore;

    

    const rewards = await StudentReward.find({ userId: user._id, status: "approved" });
    for (const reward of rewards) {
        if (user.token >= reward.token) {
            user.score -= reward.token;
        } else {
            return false;
            user.score=user.score
        }
    }

    user.rewards = rewards;
    await user.save();
    await updateStudentRankings();
    return true
};




