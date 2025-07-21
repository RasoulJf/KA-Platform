// controllers/adminReviewController.js

import StudentActivity from '../Models/StudentActivityMd.js';
import User from '../Models/UserMd.js';
import Activity from '../Models/ActivityMd.js';
import catchAsync from '../Utils/catchAsync.js';
import mongoose from 'mongoose';
import HandleERROR from '../Utils/handleError.js';
import { updateUserScore } from "../Utils/UpdateScore.js";
import Notification from '../Models/NotificationMd.js'; 

/**
 * @desc    Get statistics for student activity requests
 * @route   GET /api/admin-review/student-activity-stats
 * @access  Private (Admin, SuperAdmin)
 */
export const getStudentActivityStatsForAdmin = catchAsync(async (req, res, next) => {
    const statsPipeline = [
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $group: { _id: null, statuses: { $push: { status: '$_id', count: '$count' } } } },
        {
            $project: {
                _id: 0,
                pendingCount: { $ifNull: [ { $arrayElemAt: [ { $filter: { input: '$statuses', as: 's', cond: { $eq: ['$$s.status', 'pending'] } } }, 0 ] }, { count: 0 } ] },
                approvedCount: { $ifNull: [ { $arrayElemAt: [ { $filter: { input: '$statuses', as: 's', cond: { $eq: ['$$s.status', 'approved'] } } }, 0 ] }, { count: 0 } ] },
                rejectedCount: { $ifNull: [ { $arrayElemAt: [ { $filter: { input: '$statuses', as: 's', cond: { $eq: ['$$s.status', 'rejected'] } } }, 0 ] }, { count: 0 } ] },
            }
        },
        { $project: { pendingCount: '$pendingCount.count', approvedCount: '$approvedCount.count', rejectedCount: '$rejectedCount.count' } }
    ];

    const result = await StudentActivity.aggregate(statsPipeline);
    const stats = result.length > 0 ? result[0] : { pendingCount: 0, approvedCount: 0, rejectedCount: 0 };
    const totalRequests = stats.pendingCount + stats.approvedCount + stats.rejectedCount;

    res.status(200).json({
        success: true,
        data: {
            pendingCount: stats.pendingCount,
            approvedCount: stats.approvedCount,
            totalRequests: totalRequests,
        }
    });
});

/**
 * @desc    Get all student activities for admin review
 * @route   GET /api/admin-review/student-activities-list
 * @access  Private (Admin, SuperAdmin)
 */
// controllers/adminReviewController.js
// ... (بقیه کد کنترلر) ...

export const getAllStudentActivitiesForReview = catchAsync(async (req, res, next) => {
    // ... (کد مربوط به خواندن query params و ساخت matchStage و pipeline اولیه - بدون تغییر) ...
    const {
        status, activityParent, activityName, studentName,
        sortBy = 'createdAt', order = 'desc', page = 1, limit = 10
    } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const matchStage = {};
    if (status) matchStage.status = status;

    let pipeline = [
        { $match: matchStage },
        { $lookup: { from: User.collection.name, localField: 'userId', foreignField: '_id', as: 'userInfo' } },
        { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } },
        { $lookup: { from: Activity.collection.name, localField: 'activityId', foreignField: '_id', as: 'activityInfo' } },
        { $unwind: { path: '$activityInfo', preserveNullAndEmptyArrays: true } },
    ];

    const postLookupMatchStage = {};
    if (studentName) postLookupMatchStage['userInfo.fullName'] = { $regex: studentName, $options: 'i' };
    if (activityName) postLookupMatchStage['activityInfo.name'] = { $regex: activityName, $options: 'i' };
    if (activityParent) postLookupMatchStage['activityInfo.parent'] = activityParent;

    if (Object.keys(postLookupMatchStage).length > 0) {
        pipeline.push({ $match: postLookupMatchStage });
    }

    const sortStage = {};
    const sortMap = {
        submissionDate: 'createdAt',
        reviewDate: 'updatedAt',
        activityName: 'activityInfo.name',
        studentName: 'userInfo.fullName',
        status: 'status'
    };
    sortStage[sortMap[sortBy] || 'createdAt'] = order === 'asc' ? 1 : -1;
    pipeline.push({ $sort: sortStage });

    const countPipeline = [...pipeline, { $count: 'totalCount' }];

    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limitNum });
    // ***** این بخش بسیار مهم است و باید خط activityDefinition را داشته باشد *****
    pipeline.push({
        $project: {
            _id: 1,
            status: 1,
            submissionDate: '$createdAt',
            reviewDate: '$updatedAt',
            activityTitle: '$activityInfo.name',
            activityParent: '$activityInfo.parent',
            studentName: '$userInfo.fullName',
            studentGrade: '$userInfo.grade',
            studentClass: '$userInfo.class',
            details: '$details',
            scoreAwarded: '$scoreAwarded', // امتیاز فعلی این StudentActivity
            adminComment: '$adminComment',
            originalUserId: '$userInfo._id',
            originalActivityId: '$activityInfo._id',
            activityDefinition: '$activityInfo' // <<--- این خط اطمینان حاصل می‌کند که تمام اطلاعات Activity ارسال می‌شود
        }
    });

    const [results, countResult] = await Promise.all([
        StudentActivity.aggregate(pipeline),
        StudentActivity.aggregate(countPipeline)
    ]);

    const totalCount = countResult.length > 0 ? countResult[0].totalCount : 0;

    res.status(200).json({
        success: true,
        results: results.length,
        totalCount,
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        data: results
    });
});

// ... (بقیه کنترلرهای approveStudentActivity و rejectStudentActivity بدون تغییر باقی می‌مانند) ...

/**
 * @desc    Approve a student activity request
 * @route   PATCH /api/admin-review/student-activities/:studentActivityId/approve
 * @access  Private (Admin, SuperAdmin)
 */
// در فایل controllers/adminReviewController.js

// در فایل controllers/adminReviewController.js

export const approveStudentActivity = catchAsync(async (req, res, next) => {
    const { studentActivityId } = req.params;
    const { scoreAwarded, adminComment, details } = req.body;

    if (scoreAwarded === undefined || scoreAwarded === null || isNaN(Number(scoreAwarded))) {
        return next(new HandleERROR('امتیاز تخصیص یافته برای تایید معتبر نیست.', 400));
    }

    const studentActivity = await StudentActivity.findById(studentActivityId);
    if (!studentActivity) return next(new HandleERROR('درخواست فعالیت یافت نشد.', 404));
    if (studentActivity.status === 'approved') return next(new HandleERROR('این درخواست قبلاً تأیید شده است.', 400));

    // خواندن تعریف فعالیت به صورت امن
    const activityDef = await Activity.findById(studentActivity.activityId);
    if (activityDef) {
        const scoreDef = activityDef.scoreDefinition;
        if (scoreDef.inputType === 'select_from_enum') {
            const allowedValues = scoreDef.enumOptions.map(opt => opt.value);
            if (!allowedValues.includes(Number(scoreAwarded))) return next(new HandleERROR(`امتیاز ${scoreAwarded} در لیست مجاز نیست.`, 400));
            const allowedLabels = scoreDef.enumOptions.map(opt => opt.label);
            if (details && !allowedLabels.includes(details)) return next(new HandleERROR(`شرح "${details}" در لیست گزینه‌ها نیست.`, 400));
        }
        // می‌توانید اعتبارسنجی برای انواع دیگر را هم اینجا اضافه کنید
    }

    // آپدیت داکیومنت
    studentActivity.status = 'approved';
    studentActivity.scoreAwarded = Number(scoreAwarded);
    if (details !== undefined) studentActivity.details = details;
    if (adminComment) studentActivity.adminComment = adminComment;
    studentActivity.reviewedAt = Date.now();
    
    await studentActivity.save();

    // ایجاد اعلان به روشی امن (فقط اگر تعریف فعالیت وجود داشته باشد)
    if (activityDef) {
        try {
            await Notification.create({
                userId: studentActivity.userId,
                title: `فعالیت "${activityDef.name}" تایید شد`,
                message: `درخواست شما با موفقیت تایید و ${Number(scoreAwarded).toLocaleString('fa-IR')} امتیاز به شما تعلق گرفت.`,
                type: 'activity_status',
                relatedLink: '/activities',
                relatedDocId: studentActivity._id,
                iconBgColor: 'bg-green-500',
            });
        } catch (notificationError) {
            console.error('Failed to create notification on approval:', notificationError);
        }
    } else {
        console.warn(`Activity definition for activityId ${studentActivity.activityId} not found. Approving without creating notification.`);
    }

    // آپدیت امتیاز کاربر
    const user = await User.findById(studentActivity.userId);
    if (user) await updateUserScore(user);

    res.status(200).json({ success: true, message: "درخواست با موفقیت تایید شد.", data: studentActivity });
});

/**
 * @desc    Reject a student activity request
 * @route   PATCH /api/admin-review/student-activities/:studentActivityId/reject
 * @access  Private (Admin, SuperAdmin)
 */
export const rejectStudentActivity = catchAsync(async (req, res, next) => {
    const { studentActivityId } = req.params;
    const { adminComment } = req.body;

    const studentActivity = await StudentActivity.findById(studentActivityId);
    if (!studentActivity) return next(new HandleERROR('درخواست فعالیت یافت نشد.', 404));
    if (studentActivity.status === 'rejected') return next(new HandleERROR('این درخواست قبلاً رد شده است.', 400));
    
    // خواندن تعریف فعالیت به صورت امن
    const activityDef = await Activity.findById(studentActivity.activityId);

    // آپدیت داکیومنت
    const wasApproved = studentActivity.status === 'approved';
    studentActivity.status = 'rejected';
    studentActivity.adminComment = adminComment || "توسط ادمین رد شد.";
    studentActivity.scoreAwarded = 0;
    studentActivity.reviewedAt = Date.now();
    
    await studentActivity.save();
    
    // ایجاد اعلان به روشی امن
    if (activityDef) {
        try {
            await Notification.create({
                userId: studentActivity.userId,
                title: `فعالیت "${activityDef.name}" رد شد`,
                message: `متاسفانه درخواست شما رد شد. کامنت ادمین: ${studentActivity.adminComment}`,
                type: 'activity_status',
                relatedLink: '/my-activities',
                relatedDocId: studentActivity._id,
                iconBgColor: 'bg-red-500',
            });
        } catch (notificationError) {
            console.error('Failed to create notification on rejection:', notificationError);
        }
    } else {
        console.warn(`Activity definition for activityId ${studentActivity.activityId} not found. Rejecting without creating notification.`);
    }
    
    // آپدیت امتیاز کاربر در صورت نیاز
    if (wasApproved) {
        const user = await User.findById(studentActivity.userId);
        if (user) await updateUserScore(user);
    }

    res.status(200).json({ success: true, message: "درخواست رد شد.", data: studentActivity });
});