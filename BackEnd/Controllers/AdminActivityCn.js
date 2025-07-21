// controllers/AdminActivityCn.js
import AdminActivity from "../Models/AdminActivityMd.js";
import User from "../Models/UserMd.js";
import Activity from "../Models/ActivityMd.js";
import catchAsync from "../Utils/catchAsync.js";
import ApiFeatures from "../Utils/apiFeatures.js";
import { updateUserScore } from "../Utils/UpdateScore.js";
import HandleERROR from '../Utils/handleError.js';
import XLSX from 'xlsx'; // برای سایر توابع شما
import mongoose from "mongoose";

// ===================================================================================
// تابع createAdminActivity (با مدل جدید Activity)
// ===================================================================================
export const createAdminActivity = catchAsync(async (req, res, next) => {
    const { userId } = req.params; // یا هر نامی که برای پارامتر id در روت دارید
    const { activityId, details, scoreAwarded: scoreFromRequest, description: adminDescription } = req.body;
    if (!userId || !activityId) {
        return next(new HandleERROR("شناسه کاربر و شناسه فعالیت الزامی است.", 400));
    }
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(activityId)) {
        return next(new HandleERROR("شناسه کاربر یا فعالیت نامعتبر است.", 400));
    }

    const user = await User.findById(userId);
    if (!user) {
        return next(new HandleERROR("کاربر یافت نشد.", 404));
    }

    const activityDefinition = await Activity.findById(activityId).lean();
    if (!activityDefinition) {
        return next(new HandleERROR("تعریف فعالیت یافت نشد.", 404));
    }

    let finalScoreAwarded;
    let finalDetailsForDb = details; // مقدار پیش‌فرض برای جزئیات

    const scoreDef = activityDefinition.scoreDefinition;
    const valueInDef = activityDefinition.valueInput;

    // اعتبار سنجی الزامی بودن فیلد details (مقدار ورودی از فرم)
    if (valueInDef?.type !== 'none' && valueInDef?.required && (details === undefined || String(details).trim() === '')) {
        return next(new HandleERROR(`فیلد '${valueInDef?.label || 'جزئیات/مقدار'}' برای این فعالیت الزامی است.`, 400));
    }

    switch (scoreDef.inputType) {
        case 'select_from_enum':
            // برای این نوع، `details` از فرانت‌اند باید `label` گزینه انتخابی باشد.
            // امتیاز از `value` متناظر در `scoreDef.enumOptions` (که حالا [{label, value}] است) برداشته می‌شود.
            if (!Array.isArray(scoreDef.enumOptions) || scoreDef.enumOptions.length === 0 || !scoreDef.enumOptions.every(opt => typeof opt === 'object' && opt.label !== undefined && typeof opt.value === 'number')) {
                return next(new HandleERROR(`تعریف گزینه‌های شمارشی (enumOptions با ساختار label/value) برای فعالیت '${activityDefinition.name}' ناقص است.`, 500));
            }

            const selectedOptionObject = scoreDef.enumOptions.find(opt => opt.label === details);

            if (!selectedOptionObject) {
                return next(new HandleERROR(`گزینه انتخابی '${details}' برای فعالیت '${activityDefinition.name}' معتبر نیست.`, 400));
            }
            finalScoreAwarded = selectedOptionObject.value;
            // finalDetailsForDb همان `details` (لیبل انتخابی) باقی می‌ماند.
            break;

        case 'calculated_from_value':
            // این بخش شبیه قبل است، فقط مطمئن می‌شویم valueInDef.type با آن همخوانی دارد
            if (valueInDef?.type !== 'number') {
                return next(new HandleERROR(`فعالیت '${activityDefinition.name}' برای محاسبه امتیاز، نیازمند ورودی عددی (valueInput.type='number') است.`, 500));
            }
            const numericDetails = parseFloat(details); // `details` مقدار عددی وارد شده توسط کاربر است
            if (isNaN(numericDetails)) {
                if (valueInDef?.required || (details !== undefined && String(details).trim() !== '')) {
                    return next(new HandleERROR(`مقدار ورودی برای '${valueInDef?.label}' باید عددی باشد. مقدار دریافتی: '${details}'`, 400));
                }
                finalScoreAwarded = scoreDef.min !== undefined ? scoreDef.min : 0;
            } else {
                if ((valueInDef.numberMin !== undefined && numericDetails < valueInDef.numberMin) ||
                    (valueInDef.numberMax !== undefined && numericDetails > valueInDef.numberMax)) {
                    return next(new HandleERROR(`مقدار ورودی '${valueInDef.label}' باید بین ${valueInDef.numberMin ?? '-∞'} و ${valueInDef.numberMax ?? '+∞'} باشد. مقدار دریافتی: ${numericDetails}`, 400));
                }
                if (scoreDef.multiplier == null) {
                    return next(new HandleERROR(`ضریب (multiplier) برای فعالیت '${activityDefinition.name}' تعریف نشده است.`, 500));
                }
                finalScoreAwarded = numericDetails * scoreDef.multiplier;
                if (scoreDef.min != null) finalScoreAwarded = Math.max(scoreDef.min, finalScoreAwarded);
                if (scoreDef.max != null) finalScoreAwarded = Math.min(scoreDef.max, finalScoreAwarded);
            }
            break;

        case 'number_in_range':
        case 'manual_number_entry':
            // ادمین امتیاز را مستقیماً وارد می‌کند. `scoreFromRequest` از فرانت می‌آید.
            finalScoreAwarded = parseFloat(scoreFromRequest);
            if (isNaN(finalScoreAwarded)) {
                return next(new HandleERROR("امتیاز وارد شده باید عددی باشد.", 400));
            }
            if (scoreDef.inputType === 'number_in_range') {
                if ((scoreDef.min != null && finalScoreAwarded < scoreDef.min) || (scoreDef.max != null && finalScoreAwarded > scoreDef.max)) {
                    return next(new HandleERROR(`امتیاز برای '${activityDefinition.name}' باید بین ${scoreDef.min ?? '-∞'} و ${scoreDef.max ?? '+∞'} باشد. امتیاز وارد شده: ${finalScoreAwarded}`, 400));
                }
            }
            // `details` (اگر توسط ادمین برای این نوع فعالیت وارد شده) در finalDetailsForDb ذخیره می‌شود.
            if (valueInDef?.type === 'none') finalDetailsForDb = undefined;
            break;

        case 'fixed_from_enum_single':
            // امتیاز ثابت از اولین (و تنها) آیتم در enumOptions (که حالا {label,value} است) برداشته می‌شود.
            if (!Array.isArray(scoreDef.enumOptions) || scoreDef.enumOptions.length !== 1 || typeof scoreDef.enumOptions[0] !== 'object' || typeof scoreDef.enumOptions[0].value !== 'number') {
                return next(new HandleERROR(`امتیاز ثابت برای فعالیت '${activityDefinition.name}' به درستی (به صورت {label,value}) تعریف نشده است.`, 500));
            }
            finalScoreAwarded = scoreDef.enumOptions[0].value;
            // برای این نوع، معمولاً valueInput.type='none' است و details معنی ندارد.
            if (valueInDef?.type === 'none') {
                finalDetailsForDb = undefined;
            }
            // اگر ادمین details هم وارد کرده بود (مثلا برای valueInput.type='text')، همان در finalDetailsForDb باقی می‌ماند.
            break;

        default:
            return next(new HandleERROR(`نوع تعریف امتیاز (inputType) برای فعالیت '${activityDefinition.name}' نامعتبر است: ${scoreDef.inputType}`, 500));
    }

    if (finalScoreAwarded === undefined || finalScoreAwarded === null) {
        return next(new HandleERROR("امتیاز نهایی قابل تعیین نیست. لطفا اطلاعات ورودی و تعریف فعالیت را بررسی کنید.", 400));
    }

    const adminActivityData = {
        userId,
        activityId,
        details: finalDetailsForDb,
        scoreAwarded: finalScoreAwarded,
        description: adminDescription,
        type: 'فردی'
    };

    const adminActivity = await AdminActivity.create(adminActivityData);
    await updateUserScore(user);

    return res.status(201).json({
        success: true,
        message: "فعالیت با موفقیت برای دانش‌آموز ثبت شد.",
        data: adminActivity
    });
});


// ===================================================================================
// تابع getActivitiesByParent (بدون تغییر نسبت به نسخه قبلی شما، چون کل آبجکت Activity را برمی‌گرداند)
// ===================================================================================
export const getActivitiesByParent = catchAsync(async (req, res, next) => {
    // <<<<<<<<<<<<<<<<< تغییر کلیدی اینجاست >>>>>>>>>>>>>>>>>
    const { parentCategory } = req.params; // باید از req.params خوانده شود، نه req.query

    // این شرط حالا بیشتر برای اطمینان از خالی نبودن مقدار است،
    // چون پارامتر روت همیشه توسط Express به req.params اضافه می‌شود.
    if (!parentCategory || parentCategory.trim() === '') {
        return res.status(400).json({
            success: false,
            message: 'دسته بندی والد فعالیت (پارامتر :parentCategory در URL) الزامی و نمی‌تواند خالی باشد.'
        });
    }

    const activities = await Activity.find({ parent: parentCategory })
        .sort({ order: 1, name: 1 }) // مرتب‌سازی اولیه بر اساس فیلد order، سپس بر اساس نام
        .lean();

    // اگر می‌خواهید در صورتی که فعالیتی یافت نشد، پیام مناسب‌تری بدهید (اختیاری)
    // if (activities.length === 0) {
    //     return res.status(200).json({ // یا 404 اگر ترجیح می‌دهید
    //         success: true, // یا false اگر 404 برمی‌گردانید
    //         message: `هیچ فعالیتی در دسته‌بندی '${parentCategory}' یافت نشد.`,
    //         data: [],
    //     });
    // }

    res.status(200).json({
        success: true,
        data: activities,
    });
});



// ===================================================================================
// بقیه توابع کنترلر شما (getAllAdminActivities, getOneAdminActivity, createBulkAdminActivitiesFromExcel, etc.)
// این توابع را اینجا کپی نکردم تا پیام خیلی طولانی نشود.
// شما باید createBulkAdminActivitiesFromExcel را با دقت بررسی کنید تا با مدل جدید و فرمت اکسل شما هماهنگ باشد.
// اگر در اکسل برای select_from_enum، "لیبل گزینه" دارید، منطقش باید شبیه createAdminActivity جدید شود.
// اگر "امتیاز عددی" دارید، باید چک کند که آن عدد در مقادیر value آبجکت‌های enumOptions جدید وجود دارد یا خیر.
// ===================================================================================
// controllers/AdminActivityCn.js

// ... (سایر import ها مثل قبل)

// controllers/AdminActivityCn.js

export const getAllAdminActivities = catchAsync(async (req, res, next) => {
    let aggregationPipeline = [];

    // ... (مراحل $lookup و $unwind مثل قبل)
    aggregationPipeline.push({ $lookup: { from: User.collection.name, localField: 'userId', foreignField: '_id', as: 'user' } });
    aggregationPipeline.push({ $unwind: { path: '$user', preserveNullAndEmptyArrays: true } });
    aggregationPipeline.push({ $lookup: { from: Activity.collection.name, localField: 'activityId', foreignField: '_id', as: 'activity' } });
    aggregationPipeline.push({ $unwind: { path: '$activity', preserveNullAndEmptyArrays: true } });

    // ... (مرحله $match مثل قبل)
    const matchStage = {};
    if (req.query.studentName) matchStage['user.fullName'] = { $regex: req.query.studentName, $options: 'i' };
    if (req.query.category) matchStage['activity.parent'] = req.query.category;
    if (Object.keys(matchStage).length > 0) aggregationPipeline.push({ $match: matchStage });

    // ... (مرحله $sort مثل قبل)
    aggregationPipeline.push({ $sort: { createdAt: -1 } });

    // --- شروع تغییرات ---

    // مرحله جدید: $project برای انتخاب و فرمت‌دهی فیلدهای خروجی
    aggregationPipeline.push({
        $project: {
            _id: 1, // شناسه اصلی رکورد AdminActivity
            createdAt: 1, // <<<< مهم: صراحتاً createdAt را انتخاب می‌کنیم
            details: 1,
            scoreAwarded: 1,
            type: 1,
            // حالا آبجکت‌های activityId و userId را خودمان می‌سازیم
            activityId: { // قبلاً اسمش activity بود
                _id: '$activity._id',
                name: '$activity.name',
                parent: '$activity.parent'
            },
            userId: { // قبلاً اسمش user بود
                _id: '$user._id',
                fullName: '$user.fullName'
            }
        }
    });

    // --- پایان تغییرات ---

    // صفحه‌بندی (بدون تغییر)
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const countPipeline = [...aggregationPipeline.slice(0, -1), { $count: 'totalCount' }]; // $project را از شمارش حذف می‌کنیم
    const totalCountResult = await AdminActivity.aggregate(countPipeline);
    const totalCount = totalCountResult.length > 0 ? totalCountResult[0].totalCount : 0;

    aggregationPipeline.push({ $skip: skip }, { $limit: limit });

    // حالا دیگر نیازی به map کردن در انتها نیست، چون $project کار را انجام داده
    const adminActivities = await AdminActivity.aggregate(aggregationPipeline);

    return res.status(200).json({
        success: true,
        results: adminActivities.length,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        data: adminActivities // <<<< داده‌ها حالا فرمت صحیحی دارند
    });
});

export const getAllAdminActivitiesForUser = catchAsync(async (req, res, next) => {
    const { userId } = req.params; // یا id، مطابق روت شما
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return next(new HandleERROR("شناسه کاربر نامعتبر است.", 400));
    }
    const features = new ApiFeatures(AdminActivity.find({ userId }), req.query)
        .sort({ createdAt: -1 })
        .populate({ path: "activityId", select: "name parent description" }) // اطلاعات مورد نیاز از Activity
        .filter()
        .limitFields()
        .paginate();
    const adminActivities = await features.query;
    const totalCount = await AdminActivity.countDocuments({ userId, ...features.getQueryFilters() });

    return res.status(200).json({
        success: true,
        results: adminActivities.length,
        totalCount,
        data: adminActivities
    });
});

export const getOneAdminActivity = catchAsync(async (req, res, next) => {
    const { id } = req.params; // شناسه AdminActivity
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new HandleERROR("شناسه رکورد فعالیت نامعتبر است.", 400));
    }
    const adminActivity = await AdminActivity.findById(id).populate("activityId userId");
    if (!adminActivity) {
        return next(new HandleERROR("رکورد فعالیت ادمین با این شناسه یافت نشد.", 404));
    }
    return res.status(200).json({
        success: true,
        data: adminActivity
    });
});

export const getAdminActivitiesCount = catchAsync(async (req, res, next) => {
    const count = await AdminActivity.countDocuments();
    return res.status(200).json({
        success: true,
        data: { count }
    });
});

export const getActivityParentCategories = catchAsync(async (req, res, next) => {
    const categories = await Activity.distinct('parent');
    res.status(200).json({
        success: true,
        data: categories.filter(cat => cat),
    });
});

// تابع createBulkAdminActivitiesFromExcel نیاز به بازنویسی دقیق بر اساس فرمت اکسل شما
// و مدل جدید Activity دارد. این تابع بسیار وابسته به جزئیات است.
// در اینجا یک اسکلت کلی با فرض اینکه اکسل "لیبل گزینه" را برای select_from_enum دارد، ارائه می دهم.
export const createBulkAdminActivitiesFromExcel = catchAsync(async (req, res, next) => {
    const { parentCategory } = req.params; // <<<< از پارامتر URL خوانده می‌شود

    if (!parentCategory) {
        return next(new HandleERROR("دسته‌بندی والد فعالیت در URL مشخص نشده است.", 400));
    }
    if (!req.file) {
        return next(new HandleERROR("لطفا فایل اکسل را ارسال کنید", 400));
    }

    try {
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        // rawNumbers: false مهم است تا اعداد به عنوان رشته خوانده شوند و از دست نروند
        const jsonDataFromExcel = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: undefined, rawNumbers: false });

        if (!jsonDataFromExcel || jsonDataFromExcel.length < 2) { // حداقل یک هدر و یک ردیف داده
            return next(new HandleERROR("فایل اکسل خالی است یا فقط شامل هدر است.", 400));
        }

        const headers = jsonDataFromExcel[0].map(h => String(h || '').trim().toLowerCase());
        const dataRows = jsonDataFromExcel.slice(1);

        const adminActivitiesToCreate = [];
        const errors = [];

        // بهینه‌سازی: خواندن یکباره تمام فعالیت‌ها و کاربران
        const allActivitiesFromDB = await Activity.find({}).lean();
        const allUsersFromDB = await User.find({ role: 'student' }).select('_id idCode').lean();

        const activitiesMapByName = new Map(allActivitiesFromDB.map(act => [String(act.name).trim(), act]));
        const usersMapByIdCode = new Map(allUsersFromDB.map(usr => [String(usr.idCode).trim(), usr]));

        // نام هدرهای مورد انتظار در فایل اکسل (به حروف کوچک)
        const studentIdCodeHeaderExcel = "studentidcode";
        const activityNameHeaderExcel = "activityname";
        const detailsHeaderExcel = "details"; // برای select_from_enum، این باید لیبل گزینه باشد
        const scoreAwardedHeaderExcel = "scoreawarded"; // برای manual_entry یا number_in_range
        const adminDescriptionHeaderExcel = "admindescription";

        const studentIdCodeIndex = headers.indexOf(studentIdCodeHeaderExcel);
        const activityNameIndex = headers.indexOf(activityNameHeaderExcel);
        const detailsIndex = headers.indexOf(detailsHeaderExcel);
        const scoreAwardedIndex = headers.indexOf(scoreAwardedHeaderExcel);
        const adminDescriptionIndex = headers.indexOf(adminDescriptionHeaderExcel);

        if (studentIdCodeIndex === -1 || activityNameIndex === -1) {
            return next(new HandleERROR(`فایل اکسل باید شامل ستون‌های '${studentIdCodeHeaderExcel}' (کد ملی) و '${activityNameHeaderExcel}' (نام فعالیت) باشد.`, 400));
        }

        for (const [index, rowArray] of dataRows.entries()) {
            const rowIndexInExcel = index + 2;
            if (rowArray.every(cell => cell === undefined || String(cell).trim() === '')) continue; // رد شدن از ردیف‌های خالی

            const studentIdCode = rowArray[studentIdCodeIndex] ? String(rowArray[studentIdCodeIndex]).trim() : null;
            const activityNameInExcel = rowArray[activityNameIndex] ? String(rowArray[activityNameIndex]).trim() : null;
            const detailsFromExcel = detailsIndex !== -1 && rowArray[detailsIndex] !== undefined ? String(rowArray[detailsIndex]).trim() : undefined;
            const scoreAwardedFromExcelStr = scoreAwardedIndex !== -1 && rowArray[scoreAwardedIndex] !== undefined ? String(rowArray[scoreAwardedIndex]).trim() : undefined;
            const adminDescriptionFromExcel = adminDescriptionIndex !== -1 && rowArray[adminDescriptionIndex] !== undefined ? String(rowArray[adminDescriptionIndex]).trim() : undefined;

            if (!studentIdCode || !activityNameInExcel) {
                errors.push(`ردیف ${rowIndexInExcel}: کد ملی و نام فعالیت الزامی است.`);
                continue;
            }

            const user = usersMapByIdCode.get(studentIdCode);
            if (!user) {
                errors.push(`ردیف ${rowIndexInExcel}: دانش‌آموز با کد ملی '${studentIdCode}' یافت نشد.`);
                continue;
            }
            const activityDefinition = activitiesMapByName.get(activityNameInExcel);
            if (!activityDefinition) {
                errors.push(`ردیف ${rowIndexInExcel}: فعالیت با نام '${activityNameInExcel}' تعریف نشده.`);
                continue;
            }

            let finalScoreAwarded;
            let finalDetailsForDb = detailsFromExcel;
            const { scoreDefinition: scoreDef, valueInput: valueInDef } = activityDefinition;

            if (valueInDef?.type !== 'none' && valueInDef?.required && (detailsFromExcel === undefined || detailsFromExcel === '')) {
                errors.push(`ردیف ${rowIndexInExcel}: ستون '${headers[detailsIndex] || 'جزئیات'}' برای '${activityNameInExcel}' الزامی است.`);
                continue;
            }

            switch (scoreDef.inputType) {
                case 'select_from_enum':
                    const selectedOpt = scoreDef.enumOptions?.find(opt => opt.label === detailsFromExcel);
                    if (!selectedOpt) {
                        errors.push(`ردیف ${rowIndexInExcel}: گزینه '${detailsFromExcel}' برای '${activityNameInExcel}' معتبر نیست.`);
                        continue;
                    }
                    finalScoreAwarded = selectedOpt.value;
                    break;
                case 'calculated_from_value':
                    const numDetails = parseFloat(detailsFromExcel);
                    if (isNaN(numDetails)) {
                        if (valueInDef?.required || (detailsFromExcel && detailsFromExcel !== '')) {
                            errors.push(`ردیف ${rowIndexInExcel}: مقدار '${detailsFromExcel}' برای '${activityNameInExcel}' باید عددی باشد.`);
                            continue;
                        }
                        finalScoreAwarded = scoreDef.min ?? 0;
                    } else {
                        if ((valueInDef.numberMin != null && numDetails < valueInDef.numberMin) || (valueInDef.numberMax != null && numDetails > valueInDef.numberMax)) {
                            errors.push(`ردیف ${rowIndexInExcel}: مقدار '${numDetails}' برای '${activityNameInExcel}' خارج از محدوده مجاز (${valueInDef.numberMin}-${valueInDef.numberMax}) است.`);
                            continue;
                        }
                        finalScoreAwarded = numDetails * (scoreDef.multiplier || 1);
                        if (scoreDef.min != null) finalScoreAwarded = Math.max(scoreDef.min, finalScoreAwarded);
                        if (scoreDef.max != null) finalScoreAwarded = Math.min(scoreDef.max, finalScoreAwarded);
                    }
                    break;
                case 'number_in_range':
                case 'manual_number_entry':
                    if (!scoreAwardedFromExcelStr || isNaN(parseFloat(scoreAwardedFromExcelStr))) {
                        errors.push(`ردیف ${rowIndexInExcel}: امتیاز در ستون '${headers[scoreAwardedIndex] || 'امتیاز'}' برای '${activityNameInExcel}' الزامی و عددی است. مقدار: '${scoreAwardedFromExcelStr}'`);
                        continue;
                    }
                    finalScoreAwarded = parseFloat(scoreAwardedFromExcelStr);
                    if (scoreDef.inputType === 'number_in_range' && ((scoreDef.min != null && finalScoreAwarded < scoreDef.min) || (scoreDef.max != null && finalScoreAwarded > scoreDef.max))) {
                        errors.push(`ردیف ${rowIndexInExcel}: امتیاز '${finalScoreAwarded}' برای '${activityNameInExcel}' خارج از محدوده مجاز (${scoreDef.min}-${scoreDef.max}) است.`);
                        continue;
                    }
                    if (valueInDef?.type === 'none') finalDetailsForDb = undefined;
                    break;
                case 'fixed_from_enum_single':
                    finalScoreAwarded = scoreDef.enumOptions?.[0]?.value;
                    if (finalScoreAwarded == null) {
                        errors.push(`ردیف ${rowIndexInExcel}: امتیاز ثابت برای '${activityNameInExcel}' تعریف نشده.`);
                        continue;
                    }
                    if (valueInDef?.type === 'none') finalDetailsForDb = undefined;
                    break;
                default:
                    errors.push(`ردیف ${rowIndexInExcel}: نوع تعریف امتیاز برای '${activityNameInExcel}' نامعتبر.`);
                    continue;
            }

            if (finalScoreAwarded === undefined || finalScoreAwarded === null) {
                errors.push(`ردیف ${rowIndexInExcel}: امتیاز نهایی برای '${activityNameInExcel}' قابل محاسبه نیست.`);
                continue;
            }

            adminActivitiesToCreate.push({
                userId: user._id,
                activityId: activityDefinition._id,
                details: finalDetailsForDb,
                scoreAwarded: finalScoreAwarded,
                type: 'گروهی-اکسل',
                description: adminDescriptionFromExcel,
            });
        }

        let insertedCount = 0;
        let successfulEntriesData = [];
        if (adminActivitiesToCreate.length > 0) {
            try {
                // ================== شروع تغییرات دقیق ==================
                const result = await AdminActivity.insertMany(
                    adminActivitiesToCreate,
                    {
                        ordered: false,    // به عملیات اجازه می‌دهد حتی در صورت بروز خطا برای یک سند، ادامه یابد
                        lean: false,       // <<<< مهم: lean را false بگذارید تا اسناد کامل Mongoose با timestamps برگردانده شوند
                        timestamps: true   // <<<< مهم: صراحتاً به Mongoose می‌گوید timestamps را اعمال کند
                    }
                );
                // =================== پایان تغییرات دقیق ===================

                insertedCount = result.length;
                successfulEntriesData = result;

                // <<<< لاگ برای دیباگ >>>>
                console.log('--- INSERT MANY RESULT (First Item) ---');
                if (result && result.length > 0) {
                    console.log(result[0]); // اولین رکورد درج شده را با تمام فیلدها لاگ کن
                } else {
                    console.log('No items were inserted.');
                }
            } catch (bulkError) {
                insertedCount = bulkError.result ? bulkError.result.nInserted : 0;
                if (bulkError.writeErrors) {
                    bulkError.writeErrors.forEach(err => errors.push(`خطا در ذخیره ردیف (ایندکس ${err.index}): ${err.errmsg}`));
                } else {
                    errors.push(`خطای کلی در ذخیره سازی دسته‌ای: ${bulkError.message}`);
                }
                // بازیابی موارد موفقیت آمیز بر اساس ID های insert شده (اگر لازم باشد)
                // برای سادگی فعلا فرض می‌کنیم در صورت بروز خطا در bulk، successfulEntriesData خالی می‌ماند
                // یا باید منطق پیچیده‌تری برای شناسایی موارد موفق پیاده شود.
                if (bulkError.result && bulkError.result.insertedIds && bulkError.result.insertedIds.length > 0 && adminActivitiesToCreate.length > 0) {
                    const insertedMap = new Map(bulkError.result.insertedIds.map(item => [item.index, item._id]));
                    successfulEntriesData = adminActivitiesToCreate.filter((originalItem, index) => insertedMap.has(index))
                        .map(item => ({ ...item, _id: insertedMap.get(adminActivitiesToCreate.indexOf(item)) })); // اضافه کردن _id به موارد موفق
                } else {
                    successfulEntriesData = [];
                }
            }
        }

        if (successfulEntriesData.length > 0) {
            const usersEffected = new Set(successfulEntriesData.map(entry => String(entry.userId)));
            for (const uId of usersEffected) {
                const userToUpdate = await User.findById(uId);
                if (userToUpdate) await updateUserScore(userToUpdate);
            }
        }

        const finalMessage = `${insertedCount} رکورد با موفقیت از اکسل ثبت شد.`;
        let statusCode = insertedCount > 0 ? (errors.length > 0 ? 207 : 201) : (errors.length > 0 ? 400 : 200);
        if (adminActivitiesToCreate.length === 0 && errors.length === 0 && dataRows.some(row => !row.every(cell => cell === undefined || String(cell).trim() === ''))) {
            // اگر ردیف داده وجود داشت ولی هیچکدام به adminActivitiesToCreate نرسید و خطایی هم نبود، یعنی احتمالا همه ردیف ها خالی بودند یا شرایط را نداشتند
            statusCode = 200; // یا 400 با پیام مناسب تر
        }


        return res.status(statusCode).json({
            success: insertedCount > 0 || (adminActivitiesToCreate.length === 0 && errors.length === 0),
            message: finalMessage,
            insertedCount,
            errorCount: errors.length,
            errors: errors.length > 0 ? errors : undefined,
        });

    } catch (error) {
        console.error('خطای کلی در پردازش فایل اکسل AdminActivity:', error);
        return next(new HandleERROR(`خطا در پردازش فایل اکسل: ${error.message}`, 500));
    }
});
