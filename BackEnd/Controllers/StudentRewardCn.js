// =========================================================================
// StudentRewardCn.js (کامل با تمام اصلاحات و console.log های دیباگ)
// =========================================================================
import StudentReward from "../Models/StudentRewardMd.js";
import catchAsync from "../Utils/catchAsync.js";
import ApiFeatures from "../Utils/apiFeatures.js";
import User from "../Models/UserMd.js";
import HandleERROR from "../Utils/handleError.js"; // اگر استفاده می‌کنید
import mongoose from "mongoose";
import { updateUserScore } from "../Utils/UpdateScore.js";
// import { updateUserScore } from "../Utils/UpdateScore.js"; // اگر برای changeStatusRe استفاده می‌کنید

// --- کنترلر getMyRewardStats ---
export const getMyRewardStats = catchAsync(async (req, res, next) => {
    const userId = req.userId;
    if (!userId) { return next(new HandleERROR("User ID not found. Please login.", 401)); }
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const rewardStatsAggregation = await StudentReward.aggregate([
        { $match: { userId: userObjectId } },
        { $group: { _id: "$status", totalTokens: { $sum: "$token" }, count: { $sum: 1 } } }
    ]);

    const stats = { pendingTokens: 0, pendingCount: 0, approvedTokens: 0, approvedCount: 0, rejectedTokens: 0, rejectedCount: 0 };
    rewardStatsAggregation.forEach(group => {
        if (group._id === "pending") { stats.pendingTokens = group.totalTokens; stats.pendingCount = group.count; }
        else if (group._id === "approved") { stats.approvedTokens = group.totalTokens; stats.approvedCount = group.count; }
        else if (group._id === "rejected") { stats.rejectedTokens = group.totalTokens; stats.rejectedCount = group.count; }
    });

    const user = await User.findById(userId).select('token totalEarnedTokens'); // totalEarnedTokens اختیاری
    if (!user) { return next(new HandleERROR("User not found.", 404)); }

    const usedTokens = stats.approvedTokens;
    const totalRegisteredTokens = stats.pendingTokens + stats.approvedTokens + stats.rejectedTokens;
    const currentAvailableTokens = user.token;
    const overallTotalTokensEarned = user.totalEarnedTokens || stats.approvedTokens;

    res.status(200).json({
        success: true,
        data: {
            rewardsPendingValue: stats.pendingTokens, rewardsPaidValue: stats.approvedTokens,
            rewardsTotalRegisteredValue: totalRegisteredTokens, userAvailableTokens: currentAvailableTokens,
            userUsedTokens: usedTokens, userOverallTotalTokens: overallTotalTokensEarned,
            details: { pendingCount: stats.pendingCount, approvedCount: stats.approvedCount, rejectedTokens: stats.rejectedTokens, rejectedCount: stats.rejectedCount }
        }
    });
});

// --- کنترلر changeStatusRe (با اصلاح پیشنهادی برای کسر توکن) ---
// در StudentRewardCn.js
// در StudentRewardCn.js
export const changeStatusRe = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { status: newStatus } = req.body;

    let studentReward = await StudentReward.findById(id);
    if (!studentReward) { return next(new HandleERROR("درخواست پاداش یافت نشد.", 404)); }

    const oldStatus = studentReward.status;
    if (oldStatus === newStatus) {
        return res.status(200).json({ success: true, message: `وضعیت پاداش از قبل ${newStatus} بود.`, data: studentReward });
    }

    const user = await User.findById(studentReward.userId);
    if (!user) { return next(new HandleERROR("کاربر مربوط به این پاداش یافت نشد.", 404)); }

    let userTokenChanged = false; // فلگ برای اینکه بدونیم آیا توکن کاربر تغییر کرده

    if (newStatus === "approved") {
        if (oldStatus === "approved") { /* ... */ }
        if (user.token < studentReward.token) { return next(new HandleERROR("کاربر توکن کافی ندارد.", 400)); }

        // console.log(`CHANGE_STATUS_RE: User ${user.fullName} token BEFORE manual deduction: ${user.token} (for reward ${studentReward._id} with token ${studentReward.token})`);
        user.token -= studentReward.token;
        userTokenChanged = true;
        // console.log(`CHANGE_STATUS_RE: User ${user.fullName} token AFTER manual deduction: ${user.token}`);

        studentReward.status = "approved";
    } else if (newStatus === "rejected" || newStatus === "pending") {
        if (oldStatus === "approved") {
            // console.log(`CHANGE_STATUS_RE: User ${user.fullName} token BEFORE manual refund: ${user.token} (for reward ${studentReward._id} with token ${studentReward.token})`);
            user.token += studentReward.token;
            userTokenChanged = true;
            // console.log(`CHANGE_STATUS_RE: User ${user.fullName} token AFTER manual refund: ${user.token}`);
        }
        studentReward.status = newStatus;
    } else { /* ... خطای وضعیت نامعتبر ... */ }

    // ابتدا کاربر را ذخیره می‌کنیم (اگر توکنش تغییر کرده)
    if (userTokenChanged) {
        // console.log(`CHANGE_STATUS_RE: Saving user ${user.fullName} with new token: ${user.token}`);
        await user.save({ validateBeforeSave: false }); // این save هوک pre('save') را اجرا می‌کند
        const userAfterSave = await User.findById(user._id); // دوباره کاربر را بخوان تا مطمئن شویم توکن درست ذخیره شده
        // console.log(`CHANGE_STATUS_RE: User ${user.fullName} token AFTER save (fetched again): ${userAfterSave.token}`);
    }

    // سپس وضعیت پاداش را ذخیره می‌کنیم
    const updatedStudentReward = await studentReward.save();
    // console.log(`CHANGE_STATUS_RE: StudentReward ${updatedStudentReward._id} status saved as ${updatedStudentReward.status}`);

    // ***** حالا updateUserScore رو بعد از تمام تغییرات و save ها صدا بزن *****
    // کاربر را دوباره از دیتابیس می‌خوانیم تا مطمئن شویم آخرین نسخه را دارد
    const finalUserForUpdateScore = await User.findById(user._id);
    await updateUserScore(finalUserForUpdateScore);
    // console.log(`CHANGE_STATUS_RE: updateUserScore called for user ${finalUserForUpdateScore.fullName}`);

    return res.status(200).json({
        success: true,
        message: `وضعیت پاداش با موفقیت به ${newStatus} تغییر کرد.`,
        data: updatedStudentReward
    });
});

// --- کنترلر createStudentReward ---
// در StudentRewardCn.js


export const createStudentReward = catchAsync(async (req, res, next) => {
    // console.log("--- createStudentReward Controller ---");
    // console.log("req.userId:", req.userId);
    // console.log("req.body:", req.body);

    const { rewardId, token: requestedTokenStr } = req.body; // اسم رو به requestedTokenStr تغییر دادم برای وضوح
    const requestedTokenNum = Number(requestedTokenStr); // تبدیل به عدد

    // --- اعتبارسنجی‌های ورودی ---
    if (!rewardId || requestedTokenStr === undefined) { // چک کردن undefined برای توکن
        return next(new HandleERROR("اطلاعات rewardId و token الزامی است.", 400));
    }
    if (isNaN(requestedTokenNum) || requestedTokenNum <= 0) {
        return next(new HandleERROR("مقدار توکن باید یک عدد مثبت باشد.", 400));
    }

    // ۱. پیدا کردن تعریف پاداش برای اعتبارسنجی min/max توکن
    const rewardDefinition = await mongoose.model('Reward').findById(rewardId);
    if (!rewardDefinition) {
        return next(new HandleERROR("پاداش تعریف شده یافت نشد.", 404));
    }
    if ((rewardDefinition.minToken && requestedTokenNum < rewardDefinition.minToken) ||
        (rewardDefinition.maxToken && requestedTokenNum > rewardDefinition.maxToken)) {
        return next(new HandleERROR(`مقدار توکن باید بین ${rewardDefinition.minToken || 0} و ${rewardDefinition.maxToken || 'بی‌نهایت'} باشد.`, 400));
    }

    // ۲. پیدا کردن کاربر و بررسی موجودی توکن
    const user = await User.findById(req.userId);
    if (!user) {
        return next(new HandleERROR("کاربر یافت نشد.", 404));
    }
    if (user.token < requestedTokenNum) {
        return next(new HandleERROR("موجودی توکن شما برای این درخواست پاداش کافی نیست.", 400));
    }
    // --- پایان اعتبارسنجی‌ها ---


    // ۳. ایجاد رکورد StudentReward
    const studentReward = await StudentReward.create({
        userId: req.userId,
        rewardId: rewardId,
        token: requestedTokenNum // استفاده از مقدار عددی
        // status به طور پیش‌فرض 'pending' خواهد بود (طبق مدل)
    });

    // ۴. اضافه کردن _id پاداش جدید به آرایه rewards کاربر
    // و کسر توکن از موجودی کاربر (چون درخواست ثبت شده، توکن باید رزرو/کسر شود)
    if (studentReward) {
        user.rewards.push(studentReward._id); // اضافه کردن به لیست پاداش‌های کاربر
        // user.token -= requestedTokenNum; // <<<< آیا توکن اینجا باید کسر بشه یا موقع تایید توسط ادمین؟
                                        // اگر اینجا کسر میشه، منطق changeStatusRe نباید دوباره کسر کنه.
                                        // معمولاً بهتره توکن موقع تایید (approved) توسط ادمین کسر بشه.
                                        // پس این خط رو اینجا کامنت می‌کنیم.
        await user.save({ validateBeforeSave: false }); // ذخیره کاربر با پاداش جدید در لیستش
        // console.log(`StudentReward ${studentReward._id} added to user ${user._id} rewards list.`);
    } else {
        // اگر studentReward به هر دلیلی ساخته نشد (که بعیده بعد از create موفق)
        return next(new HandleERROR("خطا در ایجاد رکورد درخواست پاداش.", 500));
    }

    return res.status(201).json({
        success: true,
        message: "درخواست پاداش شما با موفقیت ثبت شد و در انتظار تایید می‌باشد.",
        data: studentReward
    });
});

// --- کنترلر getOneStudentReward ---
export const getOneStudentReward = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new HandleERROR('شناسه درخواست پاداش نامعتبر است.', 400));
    }
    const studentReward = await StudentReward.findById(id)
        .populate({ path: 'userId', select: 'fullName grade image' })
        .populate({ path: 'rewardId', select: 'name description parent minToken maxToken' });
    if (!studentReward) { return next(new HandleERROR('درخواست پاداش مورد نظر یافت نشد.', 404)); }
    // (بررسی دسترسی کاربر اینجا اضافه شود اگر لازم است)
    return res.status(200).json({ success: true, data: studentReward });
});

// --- کنترلر getMyStudentRewards ---
export const getMyStudentRewards = catchAsync(async (req, res, next) => {
    const userId = req.userId;
    let baseQuery = StudentReward.find({ userId })
        .populate({ path: 'userId', select: 'fullName' })
        .populate({ path: 'rewardId', select: 'name description' });
    const features = new ApiFeatures(baseQuery, req.query)
        .sort({ createdAt: -1 })
        .limitFields(); // اگر limitFields برای حذف فیلدهای populate شده استفاده میشه، باید دقت کرد
    const studentRewards = await features.query;
    return res.status(200).json({ success: true, results: studentRewards.length, data: studentRewards });
});

// --- کنترلر getAllStudentRewardsForAdmin ---
export const getAllStudentRewardsForAdmin = catchAsync(async (req, res, next) => {
    // console.log("getAllStudentRewardsForAdmin called with query:", req.query);

    // فیلترهای اولیه که می‌خواهیم قبل از populate اعمال شوند (اگر وجود دارند و ApiFeatures آنها را نمی‌سازد)
    const initialFilters = {}; // مثال: { status: req.query.status } اگر status یک فیلتر اصلی است

    let baseQuery = StudentReward.find(initialFilters)
        .populate({ path: 'userId', select: 'fullName grade image' })
        .populate({ path: 'rewardId', select: 'name description parent minToken maxToken' });

    // ApiFeatures روی کوئری که از قبل populate شده اعمال می‌شود
    // ApiFeatures شما باید بتواند فیلترها و مرتب‌سازی و صفحه‌بندی را روی این کوئری اعمال کند
    const features = new ApiFeatures(baseQuery, req.query)
        .filter() // باید با فیلترهای req.query کار کند
        .sort()   // باید با req.query.sort کار کند (پیش‌فرض createdAt: -1 خوب است)
        .paginate(); // باید با req.query.page و req.query.limit کار کند

    const studentRewards = await features.query;

    // برای totalCount، باید فیلترها را روی مدل پایه (بدون populate و paginate و sort غیر ضروری) اعمال کنیم
    const countFeatures = new ApiFeatures(StudentReward.find(initialFilters), req.query).filter();
    const totalCount = await StudentReward.countDocuments(countFeatures.getQueryFilters ? countFeatures.getQueryFilters() : initialFilters);

    // console.log("--- getAllStudentRewardsForAdmin - Final Output to Frontend ---");
    if (studentRewards && studentRewards.length > 0) {
        // console.log(`Returning ${studentRewards.length} (paginated) student rewards. Total matching: ${totalCount}`);
        // console.log("Sample FINAL studentReward to be sent:", JSON.stringify(studentRewards[0], null, 2));
    } else {
        // console.log("No student rewards to return for admin view with current filters.");
    }
    // console.log("----------------------------------------------------------");

    return res.status(200).json({
        success: true,
        results: studentRewards.length,
        totalCount: totalCount,
        data: studentRewards
    });
});

// --- کنترلر getAdminRewardStats (با اصلاح برای جلوگیری از خطای Aggregate) ---
// در StudentRewardCn.js

export const getAdminRewardStats = catchAsync(async (req, res, next) => {
    // ۱. آمار از StudentReward ها
    const rewardStatsAggregation = await StudentReward.aggregate([
        {
            $group: {
                _id: "$status", // گروه بندی بر اساس وضعیت
                totalTokensInRewards: { $sum: "$token" },
                count: { $sum: 1 }
            }
        }
        // می‌توانید مراحل بیشتری برای محاسبات پیچیده‌تر اضافه کنید
    ]);

    const rewardStats = { // <<<< آبجکت ما اینجاست
        pendingTokens: 0, pendingCount: 0,
        approvedTokens: 0, approvedCount: 0,
        rejectedTokens: 0, rejectedCount: 0,
    };
    let totalRegisteredRewardTokensValue = 0;

    rewardStatsAggregation.forEach(group => {
        totalRegisteredRewardTokensValue += (group.totalTokensInRewards || 0);
        if (group._id === "pending") {
            rewardStats.pendingTokens = group.totalTokensInRewards || 0; // <<<< اصلاح شد
            rewardStats.pendingCount = group.count || 0;                 // <<<< اصلاح شد
        } else if (group._id === "approved") {
            rewardStats.approvedTokens = group.totalTokensInRewards || 0; // <<<< اصلاح شد
            rewardStats.approvedCount = group.count || 0;                  // <<<< اصلاح شد
        } else if (group._id === "rejected") {
            rewardStats.rejectedTokens = group.totalTokensInRewards || 0; // <<<< اصلاح شد
            rewardStats.rejectedCount = group.count || 0;                   // <<<< اصلاح شد
        }
    });

    // ۲. آمار از User ها (فقط دانش‌آموزان)
    const userTokenStatsAggregation = await User.aggregate([
        { $match: { role: "student" } },
        {
            $group: {
                _id: null,
                totalAvailableStudentTokens: { $sum: "$token" },
                // totalStudentScores: { $sum: "$score" }, // اگر لازم بود
                studentCount: { $sum: 1 }
            }
        }
    ]);

    let systemTotalAvailableTokensValue = 0;
    if (userTokenStatsAggregation.length > 0 && userTokenStatsAggregation[0]) {
        systemTotalAvailableTokensValue = userTokenStatsAggregation[0].totalAvailableStudentTokens || 0;
    }

    // ---- دیباگ برای مقادیر نهایی آمار ----
    // console.log("--- Admin Stats Data to be Sent ---");
    // console.log("Calculated rewardStats:", rewardStats);
    // console.log("totalRegisteredRewardTokensValue:", totalRegisteredRewardTokensValue);
    // console.log("systemTotalAvailableTokensValue:", systemTotalAvailableTokensValue);
    // console.log("----------------------------------");
    // ---- پایان دیباگ ----

    res.status(200).json({
        success: true,
        data: {
            rewardsPendingValue: rewardStats.pendingTokens,
            rewardsPaidValue: rewardStats.approvedTokens,
            rewardsTotalRegisteredValue: totalRegisteredRewardTokensValue,
            systemTotalAvailableTokens: systemTotalAvailableTokensValue,
            systemTotalUsedOrPaidTokens: rewardStats.approvedTokens,
            systemOverallStudentTokens: systemTotalAvailableTokensValue,
        }
    });
});