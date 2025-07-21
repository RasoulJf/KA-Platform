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
import Notification from "../Models/NotificationMd.js";
import Reward from "../Models/RewardMd.js";

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
// Controllers/yourRewardController.js

export const changeStatusRe = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { status: newStatus } = req.body;

    // 1. یافتن درخواست پاداش و کاربر مربوطه
    let studentReward = await StudentReward.findById(id);
    if (!studentReward) {
        return next(new HandleERROR("درخواست پاداش یافت نشد.", 404));
    }

    const user = await User.findById(studentReward.userId);
    if (!user) {
        return next(new HandleERROR("کاربر مربوط به این پاداش یافت نشد.", 404));
    }

    // برای ایجاد اعلان بهتر، اطلاعات اصلی جایزه را می‌خوانیم
    const rewardDef = await Reward.findById(studentReward.rewardId);

    // 2. بررسی اینکه آیا وضعیت واقعاً تغییر می‌کند یا نه
    const oldStatus = studentReward.status;
    if (oldStatus === newStatus) {
        return res.status(200).json({
            success: true,
            message: `وضعیت پاداش از قبل ${newStatus} بود.`,
            data: studentReward
        });
    }

    let userTokenChanged = false;

    // 3. منطق تغییر وضعیت و توکن کاربر
    if (newStatus === "approved") {
        if (user.token < studentReward.token) {
            return next(new HandleERROR("کاربر توکن کافی برای دریافت این جایزه را ندارد.", 400));
        }
        if (oldStatus !== "approved") {
             user.token -= studentReward.token;
             userTokenChanged = true;
        }
        studentReward.status = "approved";

    } else if (newStatus === "rejected" || newStatus === "pending") {
        if (oldStatus === "approved") {
            user.token += studentReward.token;
            userTokenChanged = true;
        }
        studentReward.status = newStatus;
    } else {
        return next(new HandleERROR(`وضعیت '${newStatus}' نامعتبر است.`, 400));
    }

    // 4. ذخیره تغییرات در دیتابیس
    if (userTokenChanged) {
        await user.save({ validateBeforeSave: false });
    }
    const updatedStudentReward = await studentReward.save();
    
    // 5. **ایجاد اعلان (بخش جدید)**
    // فقط در صورتی که وضعیت به تایید یا رد تغییر کرده باشد اعلان می‌فرستیم
    if (newStatus === 'approved' || newStatus === 'rejected') {
        try {
            let notificationTitle = '';
            let notificationMessage = '';
            let iconBgColor = '';
            const rewardName = rewardDef ? rewardDef.name : 'درخواستی شما';

            if (newStatus === 'approved') {
                notificationTitle = `جایزه "${rewardName}" تایید شد`;
                notificationMessage = `درخواست شما با موفقیت تایید شد و ${studentReward.token.toLocaleString('fa-IR')} توکن از حساب شما کسر گردید.`;
                iconBgColor = 'bg-green-500';
            } else { // newStatus === 'rejected'
                notificationTitle = `جایزه "${rewardName}" رد شد`;
                notificationMessage = 'متاسفانه درخواست شما برای دریافت جایزه رد شد.';
                if (oldStatus === 'approved') {
                    notificationMessage += ` مبلغ ${studentReward.token.toLocaleString('fa-IR')} توکن به حساب شما بازگردانده شد.`;
                }
            }

            await Notification.create({
                userId: studentReward.userId,
                title: notificationTitle,
                message: notificationMessage,
                type: 'reward_status', // از enum مدل نوتیفیکیشن
                relatedLink: '/my-rewards', // لینک صفحه جوایز من در فرانت‌اند
                relatedDocId: studentReward._id,
                iconBgColor: iconBgColor,
            });

        } catch (error) {
            // اگر ساخت اعلان به مشکل خورد، نباید کل فرآیند متوقف شود
            console.error('خطا در ایجاد اعلان برای تغییر وضعیت جایزه:', error);
        }
    }

    // 6. آپدیت کلی امتیازات کاربر (این بخش را از قبل داشتید و عالی است)
    const finalUser = await User.findById(user._id);
    await updateUserScore(finalUser);

    // 7. ارسال پاسخ موفقیت‌آمیز
    res.status(200).json({
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

    try {
        const admins = await User.find({ role: { $in: ['admin', 'superAdmin'] } }).select('_id');
        
        const studentName = user ? user.fullName : 'یک دانش‌آموز';
        const rewardName = rewardDefinition ? rewardDefinition.name : 'یک پاداش';

        if (admins.length > 0) {
            const notifications = admins.map(admin => ({
                userId: admin._id,
                title: `درخواست پاداش جدید از ${studentName}`,
                message: `درخواست پاداش "${rewardName}" با هزینه ${requestedTokenNum} توکن ثبت شد.`,
                type: 'new_reward_request',
                relatedLink: `/admin/review/rewards/${studentReward._id}`, // << لینک به صفحه بررسی ادمین
                relatedDocId: studentReward._id,
                iconBgColor: 'bg-purple-500',
            }));

            await Notification.insertMany(notifications);
        }
    } catch (notificationError) {
        console.error('خطا در ایجاد اعلان پاداش برای ادمین‌ها:', notificationError);
    }
    // --- پایان کد جدید ---
    
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

// controllers/StudentRewardCn.js



// ... (بقیه توابع شما مثل getMyRewardStats و ...)

// =========================================================================
// <<< این تابع جدید رو به کنترلر اضافه کن >>>
// =========================================================================
export const getMyRewardsListPaginated = catchAsync(async (req, res, next) => {
    const userId = req.userId;
    const { 
        status, 
        rewardTitle, 
        sortBy = 'createdAt', // مرتب‌سازی پیش‌فرض
        order = 'desc', 
        page = 1, 
        limit = 10 // تعداد آیتم در هر صفحه
    } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // ۱. ساخت پایپ‌لاین aggregate
    let pipeline = [];

    // مرحله اول: فقط رکوردهای کاربر فعلی را پیدا کن
    const matchStage = { userId: new mongoose.Types.ObjectId(userId) };
    if (status) {
        matchStage.status = status;
    }
    pipeline.push({ $match: matchStage });

    // مرحله دوم: اطلاعات پاداش اصلی (از کالکشن rewards) را الحاق کن
    pipeline.push({
        $lookup: {
            from: 'rewards', // نام دقیق کالکشن پاداش‌های شما
            localField: 'rewardId',
            foreignField: '_id',
            as: 'rewardInfo'
        }
    });
    // اگر رکوردی پیدا نشد، آن را حذف نکن
    pipeline.push({ $unwind: { path: '$rewardInfo', preserveNullAndEmptyArrays: true } });

    // مرحله سوم: اطلاعات کاربر را الحاق کن (اختیاری، برای نمایش نام)
    pipeline.push({
        $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'userInfo'
        }
    });
    pipeline.push({ $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } });


    // مرحله چهارم: فیلتر بر اساس عنوان پاداش (بعد از lookup)
    if (rewardTitle) {
        pipeline.push({
            $match: { 'rewardInfo.name': { $regex: rewardTitle, $options: 'i' } }
        });
    }

    // ۲. پایپ‌لاین برای شمارش کل نتایج (بدون صفحه‌بندی)
    const countPipeline = [...pipeline, { $count: 'totalCount' }];

    // ۳. اضافه کردن مرتب‌سازی و صفحه‌بندی به پایپ‌لاین اصلی
    pipeline.push({ $sort: { [sortBy]: order === 'asc' ? 1 : -1 } });
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limitNum });
    
    // ۴. انتخاب فیلدهای نهایی
    pipeline.push({
        $project: {
            _id: 1,
            status: 1,
            createdAt: 1,
            updatedAt: 1,
            token: 1, // توکن کسر شده برای این درخواست
            adminComment: 1,
            description: 1, // توضیحات کاربر
            userId: {
                _id: '$userInfo._id',
                fullName: '$userInfo.fullName'
            },
            rewardId: {
                _id: '$rewardInfo._id',
                name: '$rewardInfo.name',
                tokenCost: '$rewardInfo.tokenCost' // توکن تعریف شده در پاداش
            }
        }
    });
    
    // ۵. اجرای همزمان هر دو پایپ‌لاین
    const [[countResult], rewards] = await Promise.all([
        StudentReward.aggregate(countPipeline),
        StudentReward.aggregate(pipeline)
    ]);

    const totalCount = countResult ? countResult.totalCount : 0;

    res.status(200).json({
        success: true,
        totalCount: totalCount,
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        data: rewards
    });
});

// =========================================================================
// >>>>>  این کنترلر جدید را به فایل StudentRewardCn.js اضافه کنید  <<<<<
// =========================================================================
export const getStudentRewardsForAdminList = catchAsync(async (req, res, next) => {
    // ۱. دریافت پارامترهای کوئری از فرانت‌اند
    const {
        status,
        rewardName,  // فیلتر بر اساس نام پاداش
        studentName, // فیلتر بر اساس نام دانش‌آموز
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        order = 'desc'
    } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // ۲. ساخت پایپ‌لاین aggregate
    let pipeline = [];

    // مرحله اول: اطلاعات پاداش اصلی (از کالکشن rewards) را الحاق کن
    pipeline.push({
        $lookup: {
            from: 'rewards', // نام دقیق کالکشن پاداش‌های شما
            localField: 'rewardId',
            foreignField: '_id',
            as: 'rewardInfo'
        }
    });
    // اگر رکوردی پیدا نشد، آن را حذف نکن
    pipeline.push({ $unwind: { path: '$rewardInfo', preserveNullAndEmptyArrays: true } });

    // مرحله دوم: اطلاعات کاربر (دانش‌آموز) را الحاق کن
    pipeline.push({
        $lookup: {
            from: 'users', // نام دقیق کالکشن کاربران شما
            localField: 'userId',
            foreignField: '_id',
            as: 'userInfo'
        }
    });
    pipeline.push({ $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } });

    // مرحله سوم: ساخت آبجکت فیلتر (Match Stage)
    // این مرحله بعد از lookup ها می‌آید تا بتوانیم روی نام دانش‌آموز و پاداش فیلتر کنیم
    const matchStage = {};
    if (status) {
        matchStage.status = status;
    }
    if (rewardName) {
        // فیلتر case-insensitive با استفاده از regex
        matchStage['rewardInfo.name'] = { $regex: rewardName, $options: 'i' };
    }
    if (studentName) {
        matchStage['userInfo.fullName'] = { $regex: studentName, $options: 'i' };
    }
    // اگر آبجکت فیلتر خالی نبود، آن را به پایپ‌لاین اضافه کن
    if (Object.keys(matchStage).length > 0) {
        pipeline.push({ $match: matchStage });
    }

    // ۳. پایپ‌لاین برای شمارش کل نتایج (بدون صفحه‌بندی و مرتب‌سازی)
    const countPipeline = [...pipeline, { $count: 'totalCount' }];

    // ۴. اضافه کردن مرتب‌سازی، صفحه‌بندی و انتخاب فیلدهای نهایی به پایپ‌لاین اصلی
    pipeline.push({ $sort: { [sortBy]: order === 'asc' ? 1 : -1 } });
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limitNum });
    
    // مرحله نهایی: انتخاب و تغییر نام فیلدها برای مطابقت با فرانت‌اند
    pipeline.push({
        $project: {
            _id: 1, // شناسه اصلی درخواست پاداش
            status: 1,
            tokenCost: '$token', // توکن کسر شده برای این درخواست
            submissionDate: '$createdAt', // تاریخ ثبت
            reviewDate: '$updatedAt', // تاریخ آخرین تغییر وضعیت (برای پرداخت)
            studentName: '$userInfo.fullName',
            studentGrade: '$userInfo.grade',
            studentImage: '$userInfo.image',
            rewardTitle: '$rewardInfo.name',
            rewardDescription: '$rewardInfo.description',
            // فیلدهای خام برای ارسال به مودال (اختیاری ولی مفید)
            raw: {
                student: '$userInfo',
                reward: '$rewardInfo',
                studentReward: {
                    _id: '$_id',
                    status: '$status',
                    token: '$token',
                    createdAt: '$createdAt'
                }
            }
        }
    });

    // ۵. اجرای همزمان هر دو پایپ‌لاین (کوئری اصلی و کوئری شمارش)
    const [[countResult], rewards] = await Promise.all([
        StudentReward.aggregate(countPipeline).exec(),
        StudentReward.aggregate(pipeline).exec()
    ]);

    const totalCount = countResult ? countResult.totalCount : 0;

    res.status(200).json({
        success: true,
        totalCount: totalCount,
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        data: rewards
    });
});