import StudentActivity from "../Models/StudentActivityMd.js";
import catchAsync from "../Utils/catchAsync.js";
import ApiFeatures from "../Utils/apiFeatures.js";
import User from "../Models/UserMd.js";
import {  updateUserScore } from "../Utils/UpdateScore.js";


// studentActivityController.js (یا هر فایلی که کنترلرهای StudentActivity در آن است)

import AdminActivity from '../Models/AdminActivityMd.js';
import mongoose from 'mongoose';

// studentActivityController.js (یا AdminActivityController.js یا یک کنترلر مشترک)

// ... (import های قبلی) ...
import Activity from '../Models/ActivityMd.js'; // اطمینان از import

export const getMyActivitiesList = catchAsync(async (req, res, next) => {
    const userId = req.userId;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // --- پارامترهای Query برای فیلتر، مرتب‌سازی و صفحه‌بندی ---
    const { status, activityTitle, sortBy = 'submissionDate', order = 'desc', page = 1, limit = 10 } = req.query;

    // --- پایپ‌لاین پایه برای هر دو نوع فعالیت ---
    const baseActivityPipeline = (collectionName) => [
        { $match: { userId: userObjectId } },
        {
            $lookup: {
                from: 'activities', // نام کالکشن Activity
                localField: 'activityId',
                foreignField: '_id',
                as: 'activityInfo'
            }
        },
        { $unwind: { path: '$activityInfo', preserveNullAndEmptyArrays: true } },
        // فیلدهای مشترک و تغییر نام یافته را انتخاب می‌کنیم
        {
            $project: {
                _id: 1,
                activityName: '$activityInfo.name',
                descriptionFromEntry: '$details', // جزئیات وارد شده توسط کاربر/ادمین
                submissionDate: '$createdAt',
                reviewDate: '$updatedAt', // این ممکن است نیاز به منطق دقیق‌تری داشته باشد
                                         // مثلاً فقط updatedAt زمانی که status تغییر کرده
                status: collectionName === 'studentactivities' ? '$status' : 'ثبت توسط ادمین', // برای AdminActivity وضعیت ثابت است
                scoreAwarded: 1,
                adminComment: collectionName === 'studentactivities' ? '$adminComment' : undefined,
                type: collectionName === 'studentactivities' ? 'ثبت توسط دانش‌آموز' : 'ثبت توسط ادمین',
                // یک فیلد برای مرتب‌سازی یکسان (createdAt برای هر دو)
                sortDate: '$createdAt'
            }
        },
    ];

    // اعمال فیلترهای خاص
    const studentActivityMatch = { userId: userObjectId };
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
        studentActivityMatch.status = status;
    }

    const studentActivitiesPipeline = [
        { $match: studentActivityMatch },
        ...baseActivityPipeline('studentactivities').slice(1) // از match اول صرف نظر کن چون بالاتر اعمال شده
    ];

    const adminActivitiesPipeline = baseActivityPipeline('adminactivities');

    // برای فیلتر بر اساس عنوان فعالیت (activityTitle)
    // این فیلتر باید بعد از $lookup و $project اولیه اعمال شود که activityName را داریم
    const titleFilterStage = [];
    if (activityTitle) {
        titleFilterStage.push({
            $match: { activityName: { $regex: activityTitle, $options: 'i' } }
        });
    }

    // اجرای پایپ‌لاین‌ها
    let studentActivities = await StudentActivity.aggregate(studentActivitiesPipeline);
    let adminActivities = await AdminActivity.aggregate(adminActivitiesPipeline);

    // اعمال فیلتر عنوان روی نتایج هر دو
    if (titleFilterStage.length > 0) {
        // برای اعمال فیلتر روی نتایج موجود، یک پایپ‌لاین دیگر اجرا نمی‌کنیم، بلکه در کد فیلتر می‌کنیم
        // یا اینکه titleFilterStage را به انتهای baseActivityPipeline اضافه کنیم (قبل از اجرای aggregate)
        // راه حل ساده تر: فیلتر در کد
        if (activityTitle) {
            const regex = new RegExp(activityTitle, 'i');
            studentActivities = studentActivities.filter(act => act.activityName && regex.test(act.activityName));
            adminActivities = adminActivities.filter(act => act.activityName && regex.test(act.activityName));
        }
    }


    // ترکیب نتایج
    let combinedActivities = [...studentActivities, ...adminActivities];

    // مرتب‌سازی
    combinedActivities.sort((a, b) => {
        const fieldA = a[sortBy] || a.sortDate; // sortDate به عنوان fallback
        const fieldB = b[sortBy] || b.sortDate;
        if (order === 'asc') {
            return fieldA > fieldB ? 1 : (fieldA < fieldB ? -1 : 0);
        } else { // desc
            return fieldA < fieldB ? 1 : (fieldA > fieldB ? -1 : 0);
        }
    });

    // صفحه‌بندی
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = pageNum * limitNum;
    const paginatedActivities = combinedActivities.slice(startIndex, endIndex);
    const totalCount = combinedActivities.length;


    res.status(200).json({
        success: true,
        results: paginatedActivities.length,
        totalCount: totalCount,
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        data: paginatedActivities
    });
});

export const getMyActivityStats = catchAsync(async (req, res, next) => {
    const userId = req.userId; // از میدل‌ور احراز هویت
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // آمار از StudentActivity
    const studentActivityStatsPipeline = StudentActivity.aggregate([
        { $match: { userId: userObjectId } },
        {
            $group: {
                _id: '$status', // گروه بندی بر اساس وضعیت
                count: { $sum: 1 }
            }
        },
        { // تبدیل به فرمتی که راحت تر بتوان به تفکیک وضعیت دسترسی داشت
            $group: {
                _id: null, // یک داکیومنت خروجی
                statuses: { $push: { status: '$_id', count: '$count' } }
            }
        },
        {
            $project: {
                _id: 0,
                pendingCount: {
                    $ifNull: [ // اگر وضعیتی وجود نداشت، صفر برگردان
                        { $arrayElemAt: [{ $filter: { input: '$statuses', as: 's', cond: { $eq: ['$$s.status', 'pending'] } } }, 0] },
                        { count: 0 } // آبجکت پیش فرض اگر فیلتر نتیجه نداشت
                    ]
                },
                approvedCount: {
                    $ifNull: [
                        { $arrayElemAt: [{ $filter: { input: '$statuses', as: 's', cond: { $eq: ['$$s.status', 'approved'] } } }, 0] },
                        { count: 0 }
                    ]
                },
                rejectedCount: { // اگر به تعداد رد شده ها هم نیاز دارید
                    $ifNull: [
                        { $arrayElemAt: [{ $filter: { input: '$statuses', as: 's', cond: { $eq: ['$$s.status', 'rejected'] } } }, 0] },
                        { count: 0 }
                    ]
                }
            }
        },
        { // فقط مقدار count را برگردان
            $project: {
                pendingCount: '$pendingCount.count',
                approvedCount: '$approvedCount.count',
                rejectedCount: '$rejectedCount.count',
            }
        }
    ]);

    // تعداد کل فعالیت های ثبت شده توسط ادمین برای این کاربر
    const adminAssignedActivitiesCountPipeline = AdminActivity.countDocuments({ userId: userObjectId });

    const [studentStatsResult, adminTotal] = await Promise.all([
        studentActivityStatsPipeline,
        adminAssignedActivitiesCountPipeline
    ]);

    const studentStats = (studentStatsResult.length > 0 && studentStatsResult[0])
        ? studentStatsResult[0]
        : { pendingCount: 0, approvedCount: 0, rejectedCount: 0 };

    const totalStudentActivities = studentStats.pendingCount + studentStats.approvedCount + studentStats.rejectedCount;

    res.status(200).json({
        success: true,
        data: {
            pendingStudentActivities: studentStats.pendingCount,
            approvedStudentActivities: studentStats.approvedCount,
            // rejectedStudentActivities: studentStats.rejectedCount, // در صورت نیاز
            totalStudentSubmitted: totalStudentActivities, // کل فعالیت های ثبت شده توسط دانش آموز
            totalAdminAssigned: adminTotal, // کل فعالیت های ثبت شده توسط ادمین برای این دانش آموز
            totalAllActivities: totalStudentActivities + adminTotal, // مجموع همه
        }
    });
});

export const changeStatusAc = catchAsync(async (req, res, next) => {
    const { id } = req.params
    const { status,adminComment="Your Request Seen" } = req.body
    const studentActivity = await StudentActivity.findByIdAndUpdate(id, { status,adminComment }, {
        new: true,
        runValidators: true
    })
    const user=await User.findById(studentActivity.userId)
    updateUserScore(user)
    return res.status(200).json({
        data: studentActivity,
        success: true,
        message:"change status Successfully"
    })
})
export const createStudentActivity=catchAsync(async(req,res,next)=>{
    const studentActivity=await StudentActivity.create({...req.body,userId:req.userId})
    return res.status(201).json({
        success:true,
        message: "studentActivity created successfully",
        data:studentActivity
    })
})
export const getAllStudentActivities=catchAsync(async(req,res,next)=>{
    const features=new ApiFeatures(StudentActivity,req.query)
    .sort()
    .populate()
    .filter()
    .limitFields()
    const studentActivities=await features.query
    return res.status(200).json({
        success:true,
        data:studentActivities
    })
})
export const getOneStudentActivity=catchAsync(async(req,res,next)=>{
    const {id}=req.params
    const studentActivity=await StudentActivity.findById(id)
    return res.status(200).json({
        data:studentActivity,
        success:true
    })
})


export const getPendingStudentActivitiesAggregated = catchAsync(async (req, res, next) => {
    const limit = parseInt(req.query.limit) || 6;
    const sortBy = req.query.sort || { createdAt: -1 }; // آبجکت برای $sort
  
    const pendingActivities = await StudentActivity.aggregate([
      {
        $match: { status: 'pending' } // فیلتر کردن درخواست‌های در حال انتظار
      },
      {
        $sort: sortBy // مرتب‌سازی (مثلاً بر اساس جدیدترین)
      },
      {
        $limit: limit // محدود کردن تعداد نتایج
      },
      {
        $lookup: { // معادل populate برای userId
          from: 'users', // نام collection کاربران (معمولاً جمع و با حرف کوچک)
          localField: 'userId',
          foreignField: '_id',
          as: 'userDetails' // نام فیلد جدید که حاوی اطلاعات کاربر join شده است
        }
      },
      {
        $unwind: { // از آنجایی که userDetails یک آرایه است (حتی اگر یک نتیجه داشته باشد)، آن را باز می‌کنیم
          path: '$userDetails',
          preserveNullAndEmptyArrays: true // اگر کاربری یافت نشد، رکورد اصلی StudentActivity حذف نشود
        }
      },
      {
        $project: { // انتخاب و تغییر نام فیلدهای خروجی
          _id: 1,
          activityId: 1,
          details: 1,
          status: 1,
          scoreAwarded: 1,
          adminComment: 1,
          createdAt: 1,
          updatedAt: 1,
          userFullName: '$userDetails.fullName', // استخراج نام کامل از آبجکت join شده
          userId: '$userDetails._id' // اگر به آی‌دی کاربر هم نیاز دارید
          // می‌توانید فیلدهای دیگری از userDetails را هم اینجا اضافه کنید
        }
      }
    ]);
  
    res.status(200).json({
      success: true,
      results: pendingActivities.length,
      data: pendingActivities,
    });
  });


  // adminReviewController.js یا studentActivityController.js


// import ApiFeatures from '../Utils/apiFeatures.js'; // اگر می‌خواهید برای بخش‌های ساده‌تر استفاده کنید
