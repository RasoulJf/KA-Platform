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

// controllers/studentActivityController.js (یا هر فایلی که این کنترلر در آن است)



export const getMyActivitiesList = catchAsync(async (req, res, next) => {
    const userId = req.userId;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // ۲. پارامتر جدید entryType را از query می‌خوانیم
    const { status, activityTitle, sortBy = 'submissionDate', order = 'desc', page = 1, limit = 10, entryType } = req.query;

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
        {
            $project: {
                _id: 1,
                activityName: '$activityInfo.name',
                details: '$details', // نام فیلد در مدل شما (ممکن است متفاوت باشد)
                submissionDate: '$createdAt',
                reviewDate: '$updatedAt',
                status: collectionName === 'studentactivities' ? '$status' : 'ثبت توسط ادمین',
                scoreAwarded: 1,
                adminComment: collectionName === 'studentactivities' ? '$adminComment' : undefined,
                description: collectionName === 'studentactivities' ? '$description' : undefined, // توضیحات دانش آموز
                type: collectionName === 'studentactivities' ? 'ثبت توسط دانش‌آموز' : 'ثبت توسط ادمین',
                sortDate: '$createdAt'
            }
        },
    ];
    
    let studentActivities = [];
    let adminActivities = [];

    // ۳. بر اساس entryType تصمیم می‌گیریم کدام داده‌ها را واکشی کنیم
    if (!entryType || entryType === 'student') {
        const studentActivityMatch = { userId: userObjectId };
        if (status && ['pending', 'approved', 'rejected'].includes(status)) {
            studentActivityMatch.status = status;
        }
        const studentActivitiesPipeline = [
            { $match: studentActivityMatch },
            ...baseActivityPipeline('studentactivities').slice(1)
        ];
        studentActivities = await StudentActivity.aggregate(studentActivitiesPipeline);
    }
    
    // اگر نوع ثبت "ادمین" بود یا هیچ فیلتری نبود، فعالیت‌های ادمین را هم بیاور
    if (!entryType || entryType === 'admin') {
        const adminActivitiesPipeline = baseActivityPipeline('adminactivities');
        adminActivities = await AdminActivity.aggregate(adminActivitiesPipeline);
    }

    // اگر فیلتر عنوان وجود داشت، روی نتایج اعمال می‌کنیم
    if (activityTitle) {
        const regex = new RegExp(activityTitle, 'i');
        studentActivities = studentActivities.filter(act => act.activityName && regex.test(act.activityName));
        adminActivities = adminActivities.filter(act => act.activityName && regex.test(act.activityName));
    }
    
    let combinedActivities = [...studentActivities, ...adminActivities];

    // مرتب‌سازی نتایج ترکیبی
    combinedActivities.sort((a, b) => {
        const sortKey = sortBy === 'activityName' ? 'activityName' : 'sortDate'; // مرتب سازی بر اساس نام یا تاریخ
        const fieldA = a[sortKey];
        const fieldB = b[sortKey];
        
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
    const paginatedActivities = combinedActivities.slice(startIndex, startIndex + limitNum);
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
