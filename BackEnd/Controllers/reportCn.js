// reportCn.js (کامل با ستون‌های جدید)

import mongoose from 'mongoose';
import ExcelJS from 'exceljs';
import catchAsync from '../Utils/catchAsync.js';
import StudentReward from '../Models/StudentRewardMd.js';
import StudentActivity from '../Models/StudentActivityMd.js';
import AdminActivity from '../Models/AdminActivityMd.js';
import User from '../Models/UserMd.js';


// ✅ FIX 1: اضافه کردن ستون‌های جدید به تابع ساخت اکسل
// در فایل reportCn.js



// بقیه کنترلرهای شما...


// reportCn.js (کامل با اصلاحات نهایی ستون‌ها)



// ✅ FIX: ستون "توضیحات ادمین" به "توضیحات" تغییر کرد
const createAndSendExcelReport = async (res, options) => {
    const { model, pipeline, reportTitle, preloadedData } = options;
    let reportData;

    try {
        if (preloadedData) {
            reportData = preloadedData;
        } else {
            reportData = await model.aggregate(pipeline).exec();
        }

        if (!reportData || reportData.length === 0) {
            return res.status(404).json({ success: false, message: "هیچ داده‌ای با این فیلترها برای گزارش یافت نشد." });
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(reportTitle, { views: [{ rightToLeft: true }] });

        // ✅ ستون‌های نهایی
        worksheet.columns = [
            { header: 'کد ملی', key: 'idCode', width: 15 },
            { header: 'نام دانش‌آموز', key: 'studentName', width: 25 },
            { header: 'پایه', key: 'studentGrade', width: 10 },
            { header: 'رشته', key: 'fieldOfStudy', width: 20 },
            { header: 'کلاس', key: 'studentClass', width: 10 },
            { header: 'عنوان رکورد', key: 'recordName', width: 30 },
            { header: 'دسته', key: 'recordParent', width: 25 },
            { header: 'توکن/امتیاز', key: 'points', width: 15 },
            { header: 'وضعیت', key: 'status', width: 15 },
            { header: 'تاریخ ثبت', key: 'submissionDate', width: 20 },
            { header: 'نوع رکورد', key: 'recordType', width: 15 },
            { header: 'جزئیات', key: 'details', width: 40 },
            { header: 'توضیحات', key: 'description', width: 40 }, // ستون جدید برای توضیحات ادمین
        ];
        
        // بقیه کد ساخت اکسل بدون تغییر ...
        worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        worksheet.getRow(1).fill = { type: 'pattern', pattern:'solid', fgColor:{argb:'FF1E295A'} };
        worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        
        reportData.forEach(item => {
            worksheet.addRow({ ...item, status: item.status === 'approved' ? 'تایید شده' : (item.status === 'pending' ? 'در انتظار' : 'رد شده'), submissionDate: item.submissionDate ? new Date(item.submissionDate).toLocaleDateString('fa-IR') : 'نامشخص' });
        });
        
        const buffer = await workbook.xlsx.writeBuffer();
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename*="UTF-8''${encodeURIComponent(reportTitle)}.xlsx"`);
        res.setHeader('Content-Length', buffer.length);
        res.send(buffer);

    } catch (error) {
        console.error("Error inside createAndSendExcelReport:", error);
        res.status(500).json({ success: false, message: 'خطای داخلی سرور هنگام ساخت گزارش اکسل.' });
    }
};

export const generateGeneralReport = catchAsync(async (req, res, next) => {
    // ... (بخش دریافت فیلترها و تعریف matchConditions و userAndFilterMatch بدون تغییر)
    console.log("Received filters on backend for new report types:", req.body);
    const { reportType, grade, students, fromDate, toDate } = req.body;
    if (!reportType) return res.status(400).json({ success: false, message: "نوع گزارش مشخص نشده است." });
    const matchConditions = {};
    if (fromDate) matchConditions.createdAt = { ...matchConditions.createdAt, $gte: new Date(new Date(fromDate).setHours(0, 0, 0, 0)) };
    if (toDate) matchConditions.createdAt = { ...matchConditions.createdAt, $lte: new Date(new Date(toDate).setHours(23, 59, 59, 999)) };
    const userAndFilterMatch = {
        'userDetails': { $ne: null },
        ...(grade && { 'userDetails.grade': grade }),
        ...(students && students.length > 0 && { 'userDetails._id': { $in: students.map(id => new mongoose.Types.ObjectId(id)) } }),
    };

    // ✅ FIX: اصلاح $project ها برای اضافه کردن فیلد description

    // Pipeline پایه برای فعالیت‌های دانش‌آموز
    const baseActivityPipeline = [
        { $match: matchConditions }, { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'userDetails' } }, { $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true } }, { $lookup: { from: 'activities', localField: 'activityId', foreignField: '_id', as: 'recordDetails' } }, { $unwind: { path: '$recordDetails', preserveNullAndEmptyArrays: true } }, { $match: userAndFilterMatch }, 
        { $project: { _id: 0, 
            idCode: '$userDetails.idCode', studentName: { $ifNull: [ '$userDetails.fullName', 'نامشخص' ] }, studentGrade: '$userDetails.grade', fieldOfStudy: '$userDetails.fieldOfStudy', studentClass: '$userDetails.class', 
            recordName: { $ifNull: [ '$recordDetails.name', 'بدون عنوان' ] }, recordParent: '$recordDetails.parent', points: { $ifNull: ['$scoreAwarded', 0] }, 
            status: '$status', submissionDate: '$createdAt', recordType: 'فعالیت دانش‌آموز', 
            details: '$details', description: null // این مدل description ندارد، پس null میذاریم
        }}
    ];
    
    // Pipeline پایه برای فعالیت‌های ادمین
    const baseAdminActivityPipeline = [
        { $match: matchConditions }, { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'userDetails' } }, { $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true } }, { $lookup: { from: 'activities', localField: 'activityId', foreignField: '_id', as: 'recordDetails' } }, { $unwind: { path: '$recordDetails', preserveNullAndEmptyArrays: true } }, { $match: userAndFilterMatch }, 
        { $project: { _id: 0, 
            idCode: '$userDetails.idCode', studentName: { $ifNull: [ '$userDetails.fullName', 'نامشخص' ] }, studentGrade: '$userDetails.grade', fieldOfStudy: '$userDetails.fieldOfStudy', studentClass: '$userDetails.class', 
            recordName: { $ifNull: [ '$recordDetails.name', 'بدون عنوان' ] }, recordParent: '$recordDetails.parent', points: { $ifNull: ['$scoreAwarded', 0] }, 
            status: 'approved', submissionDate: '$createdAt', recordType: 'فعالیت ادمین',
            details: '$details', description: '$description' // این مدل description دارد
        }}
    ];

    // Pipeline پایه برای پاداش‌ها
    const baseRewardPipeline = [
        { $match: matchConditions }, { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'userDetails' } }, { $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true } }, { $lookup: { from: 'rewards', localField: 'rewardId', foreignField: '_id', as: 'recordDetails' } }, { $unwind: { path: '$recordDetails', preserveNullAndEmptyArrays: true } }, { $match: userAndFilterMatch }, 
        { $project: { _id: 0, 
            idCode: '$userDetails.idCode', studentName: { $ifNull: [ '$userDetails.fullName', 'نامشخص' ] }, studentGrade: '$userDetails.grade', fieldOfStudy: '$userDetails.fieldOfStudy', studentClass: '$userDetails.class',
            recordName: { $ifNull: [ '$recordDetails.name', 'بدون عنوان' ] }, recordParent: '$recordDetails.parent', points: { $ifNull: ['$token', 0] }, 
            status: '$status', submissionDate: '$createdAt', recordType: 'پاداش',
            details: '$details', description: null // این مدل description ندارد، پس null میذاریم
        }}
    ];
    
    // Switch statement (بدون تغییر)
    switch (reportType) {
        case 'all_activities':
            const studentActivities = await StudentActivity.aggregate(baseActivityPipeline).exec();
            const adminActivities = await AdminActivity.aggregate(baseAdminActivityPipeline).exec();
            const combinedActivities = [...studentActivities, ...adminActivities].sort((a,b) => new Date(b.submissionDate) - new Date(a.submissionDate));
            return createAndSendExcelReport(res, { preloadedData: combinedActivities, reportTitle: "گزارش_کلی_همه_فعالیت‌ها" });

        case 'approved_student_activities':
            return createAndSendExcelReport(res, { model: StudentActivity, pipeline: [ ...baseActivityPipeline, { $match: { status: 'approved' } } ], reportTitle: "گزارش_فعالیت‌های_تاییدشده_دانش‌آموز" });

        case 'admin_activities': 
            return createAndSendExcelReport(res, { model: AdminActivity, pipeline: baseAdminActivityPipeline, reportTitle: "گزارش_فعالیت‌های_تاییدشده_ادمین" });

        case 'pending_activities': 
            return createAndSendExcelReport(res, { model: StudentActivity, pipeline: [ ...baseActivityPipeline, { $match: { status: 'pending' } } ], reportTitle: "گزارش_فعالیت‌های_درانتظار" });
        
        case 'rejected_activities': 
            return createAndSendExcelReport(res, { model: StudentActivity, pipeline: [ ...baseActivityPipeline, { $match: { status: 'rejected' } } ], reportTitle: "گزارش_فعالیت‌های_رد_شده" });

        case 'all_rewards':
            return createAndSendExcelReport(res, { model: StudentReward, pipeline: baseRewardPipeline, reportTitle: "گزارش_کلی_همه_پاداش‌ها" });
            
        case 'approved_rewards': 
            return createAndSendExcelReport(res, { model: StudentReward, pipeline: [ ...baseRewardPipeline, { $match: { status: 'approved' } } ], reportTitle: "گزارش_پاداش‌های_تایید_شده" });
        
        case 'requested_rewards':
            return createAndSendExcelReport(res, { model: StudentReward, pipeline: [ ...baseRewardPipeline, { $match: { status: 'pending' } } ], reportTitle: "گزارش_پاداش‌های_در_انتظار" });
        
        case 'rejected_rewards': 
            return createAndSendExcelReport(res, { model: StudentReward, pipeline: [ ...baseRewardPipeline, { $match: { status: 'rejected' } } ], reportTitle: "گزارش_پاداش‌های_رد_شده" });

        default: 
            return res.status(400).json({ success: false, message: "نوع گزارش نامعتبر است." });
    }
});


// بقیه کنترلرهای شما دست نخورده باقی می‌مانند
// export const createStudentActivitiesReport = ...
// export const getStudentActivityParents = ...


// ... بقیه کنترلرهای شما


// بقیه کنترلرهای شما دست نخورده باقی می‌مانند
// export const createStudentActivitiesReport = ...
// export const getStudentActivityParents = ...



export const createStudentActivitiesReport = catchAsync(async (req, res, next) => {
    // ۱. دریافت فیلترها از بدنه درخواست
    const { grade, students, activityParent, fromDate, toDate } = req.body;

    // ۲. ساخت query داینامیک برای دیتابیس با Aggregation
    const matchConditions = {};

    // فیلتر تاریخ
    if (fromDate || toDate) {
        matchConditions.createdAt = {};
        if (fromDate) matchConditions.createdAt.$gte = new Date(fromDate);
        if (toDate) matchConditions.createdAt.$lte = new Date(toDate);
    }
    
    const pipeline = [
        // مرحله اول: فیلتر اولیه بر اساس تاریخ
        { $match: matchConditions },
        
        // مرحله دوم: Join با کالکشن User برای گرفتن اطلاعات دانش‌آموز (مثل نام و پایه)
        {
            $lookup: {
                from: 'users', // نام کالکشن users در دیتابیس
                localField: 'userId',
                foreignField: '_id',
                as: 'userDetails'
            }
        },
        { $unwind: '$userDetails' },
        
        // مرحله سوم: Join با کالکشن Reward برای گرفتن اطلاعات فعالیت (مثل دسته اصلی)
        {
            $lookup: {
                from: 'rewards', // نام کالکشن rewards در دیتابیس
                localField: 'rewardId',
                foreignField: '_id',
                as: 'rewardDetails'
            }
        },
        { $unwind: '$rewardDetails' },
        
        // مرحله چهارم: فیلترهای ثانویه بر اساس داده‌های Join شده
        {
            $match: {
                // فیلتر بر اساس پایه تحصیلی
                ...(grade && { 'userDetails.grade': grade }), // فرض می‌کنیم مدل User فیلد grade دارد
                // فیلتر بر اساس دانش‌آموزان
                ...(students && students.length > 0 && { 'userDetails._id': { $in: students.map(id => new mongoose.Types.ObjectId(id)) } }),
                // فیلتر بر اساس دسته فعالیت
                ...(activityParent && { 'rewardDetails.parent': activityParent }) // فرض می‌کنیم مدل Reward فیلد parent دارد
            }
        },
        
        // مرحله پنجم: انتخاب و فرمت کردن فیلدهای نهایی برای گزارش
        {
            $project: {
                _id: 0,
                studentName: '$userDetails.name',
                studentGrade: '$userDetails.grade',
                activityName: '$rewardDetails.name',
                activityParent: '$rewardDetails.parent',
                tokens: '$token',
                status: '$status',
                submissionDate: '$createdAt'
            }
        }
    ];

    const reportData = await StudentReward.aggregate(pipeline);

    if (reportData.length === 0) {
        return res.status(404).json({ success: false, message: "هیچ داده‌ای با این فیلترها برای گزارش یافت نشد." });
    }

    // ۳. ساخت فایل اکسل با استفاده از ExcelJS
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Rahnema College Startup School';
    workbook.lastModifiedBy = 'Admin Panel';
    workbook.created = new Date();
    
    const worksheet = workbook.addWorksheet('گزارش فعالیت دانش‌آموزان');

    // تعریف هدرهای جدول
    worksheet.columns = [
        { header: 'نام دانش‌آموز', key: 'studentName', width: 25 },
        { header: 'پایه', key: 'studentGrade', width: 10 },
        { header: 'عنوان فعالیت', key: 'activityName', width: 30 },
        { header: 'دسته', key: 'activityParent', width: 25 },
        { header: 'امتیاز/توکن', key: 'tokens', width: 15 },
        { header: 'وضعیت', key: 'status', width: 15 },
        { header: 'تاریخ ثبت', key: 'submissionDate', width: 20 },
    ];
    
    // استایل‌دهی به هدر
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern:'solid',
        fgColor:{argb:'FF1E295A'} // رنگ آبی تیره
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };


    // افزودن داده‌ها به شیت
    reportData.forEach(item => {
        worksheet.addRow({
            ...item,
            status: item.status === 'approved' ? 'تایید شده' : (item.status === 'pending' ? 'در انتظار' : 'رد شده'),
            submissionDate: new Date(item.submissionDate).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' })
        });
    });

    // ۴. ارسال فایل برای دانلود
    res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
        'Content-Disposition',
        `attachment; filename="student-activities-report-${Date.now()}.xlsx"`
    );

    await workbook.xlsx.write(res);
    res.end(); // پایان دادن به پاسخ
});



// reportCn.js
// ... import های دیگر

export const getStudentActivityParents = catchAsync(async (req, res, next) => {
    const { studentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
        return next(new HandleERROR("شناسه دانش‌آموز معتبر نیست.", 400));
    }

    const pipeline = [
        // 1. فقط فعالیت‌های این دانش‌آموز را پیدا کن
        {
            $match: { userId: new mongoose.Types.ObjectId(studentId) }
        },
        // 2. با کالکشن پاداش‌ها join بزن تا به 'parent' دسترسی پیدا کنی
        {
            $lookup: {
                from: 'rewards', // نام کالکشن پاداش‌ها
                localField: 'rewardId',
                foreignField: '_id',
                as: 'rewardDetails'
            }
        },
        { $unwind: '$rewardDetails' },
        // 3. بر اساس 'parent' گروه‌بندی کن تا مقادیر منحصر به فرد به دست بیاد
        {
            $group: {
                _id: '$rewardDetails.parent'
            }
        },
        // 4. فیلدها را مرتب کن
        {
            $project: {
                _id: 0,
                parent: '$_id'
            }
        },
        {
            $sort: { parent: 1 } // مرتب‌سازی بر اساس نام دسته
        }
    ];

    const activityParents = await StudentReward.aggregate(pipeline);

    // تبدیل به فرمت { label, value } برای دراپ‌داون فرانت‌اند
    const formattedParents = activityParents.map(item => ({
        label: item.parent,
        value: item.parent
    }));

    res.status(200).json({
        success: true,
        data: formattedParents
    });
});




// ✅ FIX: کنترلر واحد و اصلی برای همه گزارش‌ها




// بقیه کنترلرهای شما...


// reportCn.js


// ✅ هر دو مدل رو ایمپورت می‌کنیم

// ✅ یک تابع کمکی برای اجرای pipeline و ساخت اکسل
// const createAndSendExcelReport = async (res, model, pipeline, reportTitle) => {
//     const reportData = await model.aggregate(pipeline);

//     if (reportData.length === 0) {
//         // این خطا رو به JSON تبدیل می‌کنیم تا فرانت‌اند بتونه پیامش رو بخونه
//         return res.status(404).json({ success: false, message: "هیچ داده‌ای با این فیلترها برای گزارش یافت نشد." });
//     }

//     // (کد ساخت اکسل بدون تغییر)
//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet(reportTitle);
//     worksheet.columns = [
//         { header: 'نام دانش‌آموز', key: 'studentName', width: 25 },
//         { header: 'پایه', key: 'studentGrade', width: 10 },
//         { header: 'عنوان رکورد', key: 'recordName', width: 30 },
//         { header: 'دسته', key: 'recordParent', width: 25 },
//         { header: 'توکن/امتیاز', key: 'points', width: 15 },
//         { header: 'وضعیت', key: 'status', width: 15 },
//         { header: 'تاریخ ثبت', key: 'submissionDate', width: 20 },
//         { header: 'نوع رکورد', key: 'recordType', width: 15 }, // هدر جدید
//     ];
//     worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
//     worksheet.getRow(1).fill = { type: 'pattern', pattern:'solid', fgColor:{argb:'FF1E295A'} };
//     worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
    
//     reportData.forEach(item => {
//         worksheet.addRow({
//             ...item,
//             status: item.status === 'approved' ? 'تایید شده' : (item.status === 'pending' ? 'در انتظار' : 'رد شده'),
//             submissionDate: item.submissionDate ? new Date(item.submissionDate).toLocaleDateString('fa-IR') : 'نامشخص'
//         });
//     });

//     res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//     res.setHeader('Content-Disposition', `attachment; filename*="UTF-8''${encodeURIComponent(reportTitle)}.xlsx"`);
//     await workbook.xlsx.write(res);
//     res.end();
// };


// کنترلر اصلی بازنویسی شده
// reportCn.js

// ... (تابع کمکی createAndSendExcelReport مثل قبل، نیازی به تغییر نیست)

// reportCn.js


// ✅ FIX: تابع کمکی اصلاح شده که یک آبجکت options می‌گیره



// بقیه کنترلرهای شما (createStudentActivitiesReport و getStudentActivityParents) دست نخورده باقی می‌مانند
// ...

// بقیه کنترلرها ...