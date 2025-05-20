import XLSX from 'xlsx';
import User from '../Models/UserMd.js';
import bcryptjs from 'bcryptjs';
import HandleERROR from '../Utils/handleError.js';
import catchAsync from '../Utils/catchAsync.js';
import Activity from '../Models/ActivityMd.js';

export const registerFromExcel = catchAsync(async (req, res, next) => {
    // 1. بررسی وجود فایل
    if (!req.file) {
        return next(new HandleERROR("لطفا فایل اکسل را ارسال کنید", 400));
    }

    try {
        // 2. خواندن فایل اکسل
        const workbook = XLSX.read(req.file.buffer);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        // 3. پردازش داده‌ها
        const usersToInsert = [];
        const errors = [];
        const duplicateIds = new Set();
        const existingUsers = await User.find({}, {idCode: 1});

        // 4. بررسی تکراری‌ها قبل از درج
        existingUsers.forEach(user => duplicateIds.add(user.idCode));

        for (const [index, row] of data.entries()) {
            try {
                // اعتبارسنجی فیلدهای ضروری
                if (!row.idCode || !row.fullName || !row.role) {
                    errors.push(`سطر ${index + 2}: فیلدهای ضروری خالی هستند`);
                    continue;
                }

                // بررسی تکراری بودن کد ملی
                if (duplicateIds.has(row.idCode.toString())) {
                    errors.push(`سطر ${index + 2}: کد ملی ${row.idCode} تکراری است`);
                    continue;
                }

                // تولید رمز عبور
                const pass = row.role === 'student' ? `s${row.idCode}` : `a${row.idCode}`;
                const hashPass = bcryptjs.hashSync(pass, 10);

                // ساخت شیء کاربر
                const userData = {
                    idCode: row.idCode.toString(),
                    fullName: row.fullName,
                    role: row.role,
                    password: hashPass,
                    fieldOfStudy: row.fieldOfStudy,
                    grade: row.grade,
                    class: row.class,
                    score: row.score || 0
                };

                // اعتبارسنجی با schema
                const user = new User(userData);
                await user.validate();
                
                usersToInsert.push(userData);
                duplicateIds.add(row.idCode.toString()); // جلوگیری از تکرار در همین فایل

            } catch (error) {
                errors.push(`سطر ${index + 2}: ${error.message}`);
            }
        }

        // 5. درج کاربران
        let insertedCount = 0;
        console.log(usersToInsert)
        if (usersToInsert.length > 0) {
            // درج به صورت دسته‌ای برای جلوگیری از خطای timeout
            const batchSize = 50;
            for (let i = 0; i < usersToInsert.length; i += batchSize) {
                const batch = usersToInsert.slice(i, i + batchSize);
                const result = await User.insertMany(batch, { ordered: false });
                insertedCount += result.length;
            }
        }

        // 6. ارسال پاسخ
        return res.status(201).json({
            success: true,
            message: `ثبت‌نام گروهی با موفقیت انجام شد`,
            insertedCount,
            errorCount: errors.length,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error('خطای کلی در پردازش فایل:', error);
        return next(new HandleERROR(
            `خطا در پردازش فایل اکسل: ${error.message}`,
            500,
            error.errors || undefined
        ));
    }
});




export const importActivitiesFromExcel = catchAsync(async (req, res, next) => {
    // 1. بررسی وجود فایل
    if (!req.file) {
        return next(new HandleERROR("لطفا فایل اکسل را ارسال کنید", 400));
    }

    try {
        // 2. خواندن فایل اکسل
        const workbook = XLSX.read(req.file.buffer);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        // 3. پردازش داده‌ها
        const activitiesToInsert = [];
        const errors = [];
        const validParents = ['فعالیت‌های آموزشی', 'فعالیت‌های شغلی', 'فعالیت‌های داوطلبانه و توسعه فردی'];

        for (const [index, row] of data.entries()) {
            try {
                // اعتبارسنجی فیلدهای ضروری
                if (!row.parent || !row.name) {
                    errors.push(`سطر ${index + 2}: فیلدهای parent و name الزامی هستند`);
                    continue;
                }

                // بررسی معتبر بودن parent
                if (!validParents.includes(row.parent)) {
                    errors.push(`سطر ${index + 2}: مقدار parent نامعتبر است. مقادیر مجاز: ${validParents.join('، ')}`);
                    continue;
                }

                // ساخت شیء فعالیت
                const activityData = {
                    parent: row.parent,
                    name: row.name,
                    description: row.description || ''
                };

                // اعتبارسنجی با schema
                const activity = new Activity(activityData);
                await activity.validate();
                
                activitiesToInsert.push(activityData);

            } catch (error) {
                errors.push(`سطر ${index + 2}: ${error.message}`);
            }
        }

        // 4. درج فعالیت‌ها
        let insertedCount = 0;
        if (activitiesToInsert.length > 0) {
            // درج به صورت دسته‌ای برای جلوگیری از خطای timeout
            const batchSize = 50;
            for (let i = 0; i < activitiesToInsert.length; i += batchSize) {
                const batch = activitiesToInsert.slice(i, i + batchSize);
                const result = await Activity.insertMany(batch, { ordered: false });
                insertedCount += result.length;
            }
        }

        // 5. ارسال پاسخ
        return res.status(201).json({
            success: true,
            message: `فعالیت‌ها با موفقیت وارد سیستم شدند`,
            insertedCount,
            errorCount: errors.length,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error('خطای کلی در پردازش فایل:', error);
        return next(new HandleERROR(
            `خطا در پردازش فایل اکسل: ${error.message}`,
            500,
            error.errors || undefined
        ));
    }
});