import XLSX from 'xlsx';
import User from '../Models/UserMd.js';
import bcryptjs from 'bcryptjs';
import HandleERROR from '../Utils/handleError.js';
import catchAsync from '../Utils/catchAsync.js';
import Activity from '../Models/ActivityMd.js';
import Reward from '../Models/RewardMd.js';

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










// Controllers/ActivityCn.js (بخشی از createActivitiesFromExcel)


// ... (سایر توابع کنترلر)

// لیست والد های مجاز (اگر می خواهید اعتبارسنجی بیشتری انجام دهید)
const VALID_PARENTS = ['موارد کسر امتیاز', 'فعالیت‌های آموزشی', 'فعالیت‌های شغلی', 'فعالیت‌های داوطلبانه و توسعه فردی'];
const VALID_VALUE_INPUT_TYPES = ['number', 'text', 'none', 'select'];
const VALID_SCORE_DEFINITION_INPUT_TYPES = ['select_from_enum', 'number_in_range', 'calculated_from_value', 'fixed_from_enum_single', 'manual_number_entry'];


export const createActivitiesFromExcel = catchAsync(async (req, res, next) => {
    if (!req.file) {
        return next(new HandleERROR("لطفا فایل اکسل را ارسال کنید", 400));
    }

    try {
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        // header: 1 برای گرفتن ردیف اول به عنوان هدرها، defval: '' برای سلول های خالی
        const jsonDataFromExcel = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: undefined });

        if (!jsonDataFromExcel || jsonDataFromExcel.length < 2) { // حداقل یک ردیف هدر و یک ردیف داده
            return next(new HandleERROR("فایل اکسل خالی است یا فقط شامل هدر است.", 400));
        }

        const headers = jsonDataFromExcel[0].map(h => String(h).trim()); // هدرهای واقعی از فایل اکسل
        const dataRows = jsonDataFromExcel.slice(1); // ردیف‌های داده

        const activitiesToInsert = [];
        const errors = [];
        const processedNamesInFile = new Set(); // برای جلوگیری از نام‌های تکراری در *همین فایل*

        for (const [index, rowArray] of dataRows.entries()) {
            const rowIndex = index + 2; // شماره ردیف در اکسل (با احتساب هدر)
            const row = {}; // تبدیل آرایه ردیف به آبجکت با استفاده از هدرها
            headers.forEach((header, i) => {
                // اگر مقدار undefined است یا رشته خالی، آن را در آبجکت row نگذار
                if (rowArray[i] !== undefined && String(rowArray[i]).trim() !== "") {
                    row[header] = rowArray[i];
                }
            });

            console.log(`\nProcessing Excel row ${rowIndex}:`, row);

            try {
                // --- اعتبارسنجی اولیه فیلدهای اصلی ---
                if (!row.parent || !row.name || !row['scoreDefinition.inputType']) {
                    errors.push(`سطر ${rowIndex}: فیلدهای 'parent', 'name', و 'scoreDefinition.inputType' الزامی هستند.`);
                    continue;
                }
                if (VALID_PARENTS.indexOf(row.parent) === -1) {
                     errors.push(`سطر ${rowIndex}: مقدار '${row.parent}' برای 'parent' معتبر نیست.`);
                     continue;
                }
                 if (row['valueInput.type'] && VALID_VALUE_INPUT_TYPES.indexOf(row['valueInput.type']) === -1) {
                    errors.push(`سطر ${rowIndex}: مقدار '${row['valueInput.type']}' برای 'valueInput.type' معتبر نیست.`);
                    continue;
                }
                if (VALID_SCORE_DEFINITION_INPUT_TYPES.indexOf(row['scoreDefinition.inputType']) === -1) {
                    errors.push(`سطر ${rowIndex}: مقدار '${row['scoreDefinition.inputType']}' برای 'scoreDefinition.inputType' معتبر نیست.`);
                    continue;
                }
                if (processedNamesInFile.has(String(row.name).trim())) {
                    errors.push(`سطر ${rowIndex}: نام فعالیت '${row.name}' قبلاً در این فایل اکسل وجود داشته است.`);
                    continue;
                }


                // --- ساخت آبجکت activityData ---
                const activityData = {
                    parent: String(row.parent).trim(),
                    name: String(row.name).trim(),
                    description: row.description ? String(row.description).trim() : undefined,
                    valueInput: {
                        type: row['valueInput.type'] ? String(row['valueInput.type']).trim() : 'text', // پیش فرض
                        label: row['valueInput.label'] ? String(row['valueInput.label']).trim() : 'جزئیات/مقدار', // پیش فرض
                        options: row['valueInput.options'] ? String(row['valueInput.options']).split(',').map(s => s.trim()).filter(s => s) : undefined,
                        required: row['valueInput.required'] !== undefined ? String(row['valueInput.required']).toLowerCase() === 'true' : false, // پیش فرض
                        numberMin: row['valueInput.numberMin'] !== undefined ? Number(row['valueInput.numberMin']) : undefined,
                        numberMax: row['valueInput.numberMax'] !== undefined ? Number(row['valueInput.numberMax']) : undefined,
                    },
                    scoreDefinition: {
                        inputType: String(row['scoreDefinition.inputType']).trim(),
                        multiplier: row['scoreDefinition.multiplier'] !== undefined ? Number(row['scoreDefinition.multiplier']) : undefined,
                        enumOptions: row['scoreDefinition.enumOptions'] ? String(row['scoreDefinition.enumOptions']).split(',').map(s => Number(s.trim())).filter(n => !isNaN(n)) : undefined,
                        min: row['scoreDefinition.min'] !== undefined ? Number(row['scoreDefinition.min']) : undefined,
                        max: row['scoreDefinition.max'] !== undefined ? Number(row['scoreDefinition.max']) : undefined,
                    }
                };

                // پاک کردن فیلدهای undefined از آبجکت های تودرتو برای جلوگیری از ذخیره کلیدهای خالی
                Object.keys(activityData.valueInput).forEach(key => activityData.valueInput[key] === undefined && delete activityData.valueInput[key]);
                Object.keys(activityData.scoreDefinition).forEach(key => activityData.scoreDefinition[key] === undefined && delete activityData.scoreDefinition[key]);
                if (Object.keys(activityData.valueInput).length === 0) delete activityData.valueInput;
                // scoreDefinition همیشه inputType دارد پس خالی نمی شود


                console.log(`Constructed activityData for row ${rowIndex}:`, JSON.stringify(activityData, null, 2));

                const activity = new Activity(activityData);
                await activity.validate(); // اعتبارسنجی بر اساس مدل Mongoose

                activitiesToInsert.push(activity.toObject()); // .toObject() برای گرفتن آبجکت خام
                processedNamesInFile.add(activityData.name);

            } catch (error) {
                let message = `خطا در پردازش سطر ${rowIndex} اکسل: ${error.message}`;
                if (error.name === 'ValidationError') {
                    message = `سطر ${rowIndex} (اعتبارسنجی مدل): ${Object.values(error.errors).map(e => e.message).join(', ')}`;
                }
                console.error(message, error);
                errors.push(message);
            }
        }

        console.log("Total activities to insert:", activitiesToInsert.length);
        console.log("Total errors during row processing:", errors.length, errors);

        let insertedCount = 0;
        let allInsertedDocuments = [];
        const failedToInsertErrors = []; // خطاهایی که در زمان insertMany رخ می دهند

        if (activitiesToInsert.length > 0) {
            try {
                // استفاده از upsert بر اساس نام فعالیت برای جلوگیری از تکراری (یا به روز رسانی)
                // این بخش پیچیده تر است. برای سادگی، فعلا insertMany می کنیم و خطای duplicate key را مدیریت می کنیم.
                // یا ابتدا نام های موجود در دیتابیس را چک کنید.

                // راه ساده تر: ابتدا فعالیت های موجود با نام های مشابه را حذف کنید یا از insert صرف نظر کنید.
                // برای این مثال، فرض میکنیم میخواهیم اگر فعالیتی با همان نام بود، آن را آپدیت کنیم (upsert)
                // یا اینکه ابتدا چک کنیم و اگر بود، skip کنیم.
                // **برای سادگی، ابتدا insertMany می کنیم و خطای duplicate key را می گیریم.**

                const result = await Activity.insertMany(activitiesToInsert, { ordered: false, throwOnValidationError: false });
                insertedCount = result.length;
                allInsertedDocuments = result;

            } catch (bulkError) {
                console.error("Bulk insert error:", bulkError);
                if (bulkError.writeErrors) {
                    bulkError.writeErrors.forEach(err => {
                        const activityNameInError = activitiesToInsert[err.index]?.name || `ردیف اکسل مرتبط با ایندکس ${err.index}`;
                        if (err.code === 11000) { // Duplicate key error
                            failedToInsertErrors.push(`فعالیت با نام '${activityNameInError}' قبلاً در دیتابیس موجود است و اضافه نشد.`);
                        } else {
                            failedToInsertErrors.push(`خطا در اضافه کردن فعالیت '${activityNameInError}': ${err.errmsg}`);
                        }
                    });
                } else if (bulkError.result && bulkError.result.writeErrors) {
                     bulkError.result.writeErrors.forEach(err => {
                        const activityNameInError = activitiesToInsert[err.index]?.name || `ردیف اکسل مرتبط با ایندکس ${err.index}`;
                        if (err.code === 11000) {
                            failedToInsertErrors.push(`فعالیت با نام '${activityNameInError}' قبلاً در دیتابیس موجود است و اضافه نشد.`);
                        } else {
                            failedToInsertErrors.push(`خطا در اضافه کردن فعالیت '${activityNameInError}': ${err.errmsg}`);
                        }
                    });
                }
                else {
                    failedToInsertErrors.push(`خطای کلی در insertMany: ${bulkError.message}`);
                }
                errors.push(...failedToInsertErrors);
                // تعداد واقعی insert شده ها را باید از نتیجه bulkError بگیریم اگر بخشی موفق بوده
                insertedCount = bulkError.result ? bulkError.result.nInserted : 0;
                // allInsertedDocuments هم باید بر اساس عملیات موفق پر شود که پیچیده تر است.
                // برای سادگی، اگر خطای bulk رخ داد، allInsertedDocuments را خالی می گذاریم یا باید از bulkError.insertedIds استفاده کرد.
                allInsertedDocuments = []; // یا استخراج ID های موفق از bulkError
            }
        }

        const finalMessage = `${insertedCount} فعالیت با موفقیت از فایل اکسل اضافه/به‌روزرسانی شد. ${errors.length > 0 ? `${errors.length} خطا نیز وجود داشت.` : ''}`;
        const overallSuccess = insertedCount > 0 || (activitiesToInsert.length === 0 && errors.length === 0); // موفقیت آمیز اگر چیزی insert شده یا فایل خالی بوده و خطایی هم نبوده

        return res.status(errors.length > 0 && insertedCount === 0 ? 400 : 201).json({
            success: overallSuccess,
            message: finalMessage,
            insertedCount,
            data: allInsertedDocuments.map(doc => doc.toObject()), // تبدیل به آبجکت ساده برای پاسخ
            errorCount: errors.length,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error('خطای کلی در پردازش فایل اکسل برای فعالیت‌ها:', error);
        return next(new HandleERROR(
            `خطا در پردازش فایل اکسل: ${error.message}`,
            500
        ));
    }
});






// مقادیر مجاز برای فیلد parent از اسکیمای Reward
const VALID_REWARD_PARENTS = ["پاداش‌های عمومی", "پاداش‌های اختصاصی", "پاداش نیکوکارانه"];

export const createRewardsFromExcel = catchAsync(async (req, res, next) => {
    console.log("1. createRewardsFromExcel controller reached.");

    if (!req.file) {
        console.log("Error: No file uploaded.");
        return next(new HandleERROR("لطفا فایل اکسل را ارسال کنید", 400));
    }
    console.log("2. File received:", req.file.originalname);

    try {
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonDataFromExcel = XLSX.utils.sheet_to_json(worksheet);

        console.log("3. Excel data (first 2 rows):", jsonDataFromExcel.slice(0, 2));

        if (!jsonDataFromExcel || jsonDataFromExcel.length === 0) {
            console.log("Error: Excel file is empty or has incorrect format.");
            return next(new HandleERROR("فایل اکسل خالی است یا فرمت صحیحی ندارد.", 400));
        }

        const rewardsToInsert = [];
        const errors = [];
        const processedRewardNamesInFile = new Set(); // برای جلوگیری از نام‌های تکراری در همین فایل

        // اختیاری: خواندن نام پاداش‌های موجود برای جلوگیری از تکرار با دیتابیس
        // اگر نیاز به یونیک بودن name دارید، این بخش را فعال کنید و در schema هم unique index بگذارید
        // const existingRewards = await Reward.find({}, { name: 1 });
        // const existingRewardNames = new Set(existingRewards.map(rew => rew.name));

        for (const [index, row] of jsonDataFromExcel.entries()) {
            const rowIndex = index + 2; // شماره ردیف در اکسل (با فرض هدر در ردیف اول)
            console.log(`\n4. Processing row ${rowIndex} from Excel:`, row);

            try {
                // خواندن مقادیر از ردیف اکسل
                // فرض می‌کنیم هدرهای اکسل با نام فیلدها یکی هستند
                const parent = row.parent;
                const name = row.name;
                const description = row.description;
                const minToken = row.minToken;
                const maxToken = row.maxToken;

                console.log(`5. Values extracted for row ${rowIndex}:`, { parent, name, description, minToken, maxToken });

                // اعتبارسنجی فیلدهای ضروری (با توجه به schema: parent و name اجباری هستند)
                if (!parent || typeof parent !== 'string' || parent.trim() === '') {
                    errors.push(`سطر ${rowIndex}: فیلد 'parent' ضروری است و نمی‌تواند خالی باشد.`);
                    continue;
                }
                if (!name || typeof name !== 'string' || name.trim() === '') {
                    errors.push(`سطر ${rowIndex}: فیلد 'name' ضروری است و نمی‌تواند خالی باشد.`);
                    continue;
                }

                // اعتبارسنجی مقدار parent
                if (!VALID_REWARD_PARENTS.includes(parent.trim())) {
                    errors.push(`سطر ${rowIndex}: مقدار '${parent}' برای فیلد 'parent' معتبر نیست. مقادیر مجاز: ${VALID_REWARD_PARENTS.join(', ')}`);
                    continue;
                }

                // بررسی تکراری بودن نام در فایل فعلی
                if (processedRewardNamesInFile.has(name.trim())) {
                    errors.push(`سطر ${rowIndex}: نام پاداش '${name}' در این فایل تکراری است.`);
                    continue;
                }
                // اختیاری: بررسی تکراری بودن نام با دیتابیس
                // if (existingRewardNames && existingRewardNames.has(name.trim())) {
                //     errors.push(`سطر ${rowIndex}: نام پاداش '${name}' قبلا در سیستم ثبت شده است.`);
                //     continue;
                // }

                // ساخت شیء پاداش
                const rewardData = {
                    parent: parent.trim(),
                    name: name.trim(),
                    description: (description !== undefined && description !== null) ? String(description).trim() : undefined,
                    minToken: (minToken !== undefined && minToken !== null && String(minToken).trim() !== '') ? Number(minToken) : undefined,
                    maxToken: (maxToken !== undefined && maxToken !== null && String(maxToken).trim() !== '') ? Number(maxToken) : undefined,
                };

                console.log(`7. Constructed rewardData for row ${rowIndex}:`, rewardData);

                // اعتبارسنجی با schema ی Mongoose
                const reward = new Reward(rewardData);
                await reward.validate(); // اگر خطایی باشد، اینجا throw می‌شود

                rewardsToInsert.push(reward.toObject()); // .toObject() برای گرفتن plain object
                processedRewardNamesInFile.add(name.trim());
                // if (existingRewardNames) existingRewardNames.add(name.trim());

            } catch (error) { // خطای مربوط به یک سطر خاص
                let message = error.message;
                if (error.name === 'ValidationError') {
                    message = Object.values(error.errors).map(e => e.message).join(', ');
                }
                errors.push(`سطر ${rowIndex}: ${message}`);
                console.log(`Error processing row ${rowIndex}:`, message);
            }
        }

        console.log("8. Total rewards to insert:", rewardsToInsert.length);
        console.log("9. Total errors during row processing:", errors.length, errors);

        // درج پاداش‌ها
        let insertedCount = 0;
        let allInsertedDocuments = [];
        if (rewardsToInsert.length > 0) {
            try {
                const batchSize = 100; // می‌توانید تنظیم کنید
                for (let i = 0; i < rewardsToInsert.length; i += batchSize) {
                    const batch = rewardsToInsert.slice(i, i + batchSize);
                    const result = await Reward.insertMany(batch, { ordered: false });
                    insertedCount += result.length;
                    allInsertedDocuments = allInsertedDocuments.concat(result);
                }
            } catch (bulkError) {
                console.error('Bulk insert error:', bulkError);
                if (bulkError.writeErrors && bulkError.writeErrors.length > 0) {
                    bulkError.writeErrors.forEach(err => {
                        const failedDocName = err.err.op ? err.err.op.name : 'ناشناخته';
                        errors.push(`خطا در درج پاداش با نام '${failedDocName}': ${err.err.errmsg || err.err.message}`);
                    });
                } else {
                    errors.push(`خطای کلی در هنگام درج گروهی: ${bulkError.message}`);
                }
            }
        }

        console.log("10. Final insertedCount:", insertedCount);
        console.log("11. Final allInsertedDocuments (first 2):", allInsertedDocuments.slice(0, 2));

        // ارسال پاسخ
        const isGenerallySuccessful = insertedCount > 0;
        const responseStatus = errors.length > 0 && insertedCount === 0 ? 400 : (insertedCount > 0 ? 201 : 200) ; // 200 if no errors and nothing inserted
        const message = insertedCount > 0 ?
                        `${insertedCount} پاداش با موفقیت از فایل اکسل اضافه شد.` :
                        (errors.length > 0 ? `عملیات با ${errors.length} خطا همراه بود و هیچ پاداشی اضافه نشد.` : `هیچ پاداش جدیدی برای افزودن یافت نشد.`);
        if(insertedCount > 0 && errors.length > 0) {
            message += ` همچنین ${errors.length} خطا نیز وجود داشت.`;
        }


        return res.status(responseStatus).json({
            success: isGenerallySuccessful || (insertedCount === 0 && errors.length === 0), // True if success or nothing to do with no errors
            message,
            insertedCount,
            data: allInsertedDocuments,
            errorCount: errors.length,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) { // خطای کلی در پردازش فایل یا خطای غیرمنتظره
        console.error('خطای کلی در پردازش فایل اکسل برای پاداش‌ها:', error);
        return next(new HandleERROR(
            `خطا در پردازش فایل اکسل: ${error.message}`,
            500
        ));
    }
});