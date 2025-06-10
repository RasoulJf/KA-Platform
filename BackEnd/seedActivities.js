// seedActivities.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Activity from './Models/ActivityMd.js'; // مطمئن شوید مسیر به مدل شما صحیح است
import { __dirname } from "./app.js"; // اگر از __dirname به این شکل استفاده می‌کنید

// اگر فایل .env شما در ریشه پروژه است، dotenv.config() کافی است.
dotenv.config();

const activitiesData = [
    // -------------------- فعالیت‌های آموزشی --------------------
    {
        parent: "فعالیت‌های آموزشی",
        name: "معدل نوبت اول",
        order: 1, // << ترتیب نمایش در این دسته
        description: "معدل کل کارنامه نوبت اول × ۵",
        valueInput: { type: "number", label: "معدل کل نوبت اول (۰-۲۰)", required: true, numberMin: 0, numberMax: 20 },
        scoreDefinition: { inputType: "calculated_from_value", multiplier: 5, min: 0, max: 100 }
    },
    {
        parent: "فعالیت‌های آموزشی",
        name: "معدل نوبت دوم",
        order: 2,
        description: "معدل کل کارنامه نوبت دوم × ۱۰",
        valueInput: { type: "number", label: "معدل کل نوبت دوم (۰-۲۰)", required: true, numberMin: 0, numberMax: 20 },
        scoreDefinition: { inputType: "calculated_from_value", multiplier: 10, min: 0, max: 200 }
    },
    {
        parent: "فعالیت‌های آموزشی",
        name: "سطح مهارت ۱",
        order: 3,
        description: "بر اساس نمره کسب شده در چالش تعیین سطح مهارتی",
        valueInput: { type: "number", label: "نمره چالش سطح مهارت ۱", required: true, numberMin: 0, numberMax: 100 },
        scoreDefinition: { inputType: "calculated_from_value", multiplier: 1, min: 0, max: 100 }
    },
    {
        parent: "فعالیت‌های آموزشی",
        name: "سطح مهارت ۲",
        order: 4,
        description: "بر اساس نمره کسب شده در چالش تعیین سطح مهارتی",
        valueInput: { type: "number", label: "نمره چالش سطح مهارت ۲", required: true, numberMin: 0, numberMax: 100 },
        scoreDefinition: { inputType: "calculated_from_value", multiplier: 1, min: 0, max: 100 }
    },

    // -------------------- فعالیت‌های شغلی --------------------
    {
        parent: "فعالیت‌های شغلی",
        name: "کارآموزی و کارورزی در شرکت‌ها",
        order: 1,
        description: "کارآموزی در شرکت سطح A+: ۳۰ / سطح B+: ۱۵",
        valueInput: { type: "select", label: "سطح شرکت کارآموزی", required: true }, // options از scoreDefinition.enumOptions.label خوانده می‌شود
        scoreDefinition: {
            inputType: "select_from_enum",
            // valueInput.options قبلی شما: ["شرکت سطح A+", "شرکت سطح B+"]
            // scoreDefinition.enumOptions قبلی شما: [15, 30]
            // با توجه به description، "شرکت سطح A+" باید 30 و "B+" باید 15 باشد.
            enumOptions: [
                { label: "شرکت سطح A+", value: 30 },
                { label: "شرکت سطح B+", value: 15 }
            ]
        }
    },
    {
        parent: "فعالیت‌های شغلی",
        name: "پروژه‌های درآمدی (فریلنسری)",
        order: 2,
        description: "پروژه سطح A+: ۱۵ / پروژه سطح B+: ۱۰ / پروژه سطح C+: ۵",
        valueInput: { type: "select", label: "سطح پروژه فریلنسری", required: true },
        scoreDefinition: {
            inputType: "select_from_enum",
            // valueInput.options قبلی: ["پروژه سطح A+", "پروژه سطح B+", "پروژه سطح C+"]
            // scoreDefinition.enumOptions قبلی: [5, 10, 15]
            // با توجه به description:
            enumOptions: [
                { label: "پروژه سطح A+", value: 15 },
                { label: "پروژه سطح B+", value: 10 },
                { label: "پروژه سطح C+", value: 5 }
            ]
        }
    },
    {
        parent: "فعالیت‌های شغلی",
        name: "قراردادهای استخدامی در شرکت‌ها",
        order: 3,
        description: "استخدام در شرکت سطح A+: ۷۰ / سطح B+: ۵۰",
        valueInput: { type: "select", label: "سطح شرکت استخدام", required: true },
        scoreDefinition: {
            inputType: "select_from_enum",
            // valueInput.options قبلی: ["شرکت سطح A+", "شرکت سطح B+"]
            // scoreDefinition.enumOptions قبلی: [50, 70]
            // با توجه به description:
            enumOptions: [
                { label: "شرکت سطح A+", value: 70 },
                { label: "شرکت سطح B+", value: 50 }
            ]
        }
    },

    // -------------------- فعالیت‌های داوطلبانه و توسعه فردی --------------------
    {
        parent: "فعالیت‌های داوطلبانه و توسعه فردی",
        name: "تعداد شرکت در جلسات کوچینگ",
        order: 1,
        description: "به ازای هر جلسه کوچینگ، امتیاز ۱ تا ۵ (اینجا فرض شده هر جلسه ۱ امتیاز، سقف ۵ جلسه مطابق اکسل)",
        valueInput: { type: "number", label: "تعداد جلسات شرکت شده", required: true, numberMin: 1},
        scoreDefinition: { inputType: "calculated_from_value", multiplier: 5, min:5,  } // اکسل min=1, max=5 دارد
    },
    {
        parent: "فعالیت‌های داوطلبانه و توسعه فردی",
        name: "کیفیت حضور در هر جلسه کوچینگ",
        order: 2,
        description: "به ازای هر جلسه کوچینگ (امتیاز ۱ تا ۵ توسط ادمین)",
        valueInput: { type: "text", label: "توضیحات جلسه (اختیاری)", required: false },
        scoreDefinition: { inputType: "number_in_range",multiplier: 1, min: 1, max: 5 }
    },
    {
        parent: "فعالیت‌های داوطلبانه و توسعه فردی",
        name: "همکاری در فعالیت‌های مدرسه",
        order: 3,
        description: "همکاری در فعالیت‌های اجرایی، مدیریت فضای مجازی و ...",
        valueInput: { type: "select", label: "سطح همکاری", required: true }, // شما باید لیبل‌های معنی‌دار برای اینها در نظر بگیرید
        scoreDefinition: {
            inputType: "select_from_enum",
            // scoreDefinition.enumOptions قبلی: [10, 20, 30]
            // valueInput.options قبلی در فایل شما تعریف نشده بود. من لیبل‌های نمونه می‌گذارم:
            enumOptions: [
                { label: "همکاری سطح بالا (مثلاً برای ۳۰ امتیاز)", value: 30 },
                { label: "همکاری سطح متوسط (مثلاً برای ۲۰ امتیاز)", value: 20 },
                { label: "همکاری سطح پایه (مثلاً برای ۱۰ امتیاز)", value: 10 }
            ]
        }
    },
    {
        parent: "فعالیت‌های داوطلبانه و توسعه فردی",
        name: "تعداد شرکت در جشنواره‌ها و مسابقات",
        order: 4,
        description: "به ازای هر جشنواره علمی، هنری و ورزشی رسمی. حداکثر امتیاز ۱۰.",
        // در اکسل شما max=10 دارد. فرض می‌کنیم هر رویداد ۲ امتیاز، پس تا ۵ رویداد.
        valueInput: { type: "number", label: "تعداد جشنواره/مسابقه  ", required: true, numberMin: 1},
        scoreDefinition: { inputType: "calculated_from_value", multiplier: 10, }
    },
    {
        parent: "فعالیت‌های داوطلبانه و توسعه فردی",
        name: "کسب رتبه در جشنواره‌ها و مسابقات",
        order: 5,
        description: "رتبه اول ناحیه: +۳۰ / رتبه دوم ناحیه: +۲۵ / ...",
        valueInput: { type: "select", label: "رتبه و سطح رویداد", required: true },
        scoreDefinition: {
            inputType: "select_from_enum",
            // scoreDefinition.enumOptions قبلی: [20, 25, 30, 35, 40, 45, 50]
            // **شما باید لیبل‌های دقیق را برای هر یک از این امتیازها بر اساس description کامل در اکسل تعریف کنید.**
            // اینها فقط نمونه هستند:
            enumOptions: [
                { label: "رتبه اول کشوری / معادل (امتیاز ۵۰)", value: 50 },
                { label: "رتبه دوم کشوری / معادل (امتیاز ۴۵)", value: 45 },
                { label: "رتبه سوم کشوری / اول استانی / معادل (امتیاز ۴۰)", value: 40 },
                { label: "رتبه دوم استانی  / معادل (امتیاز 35)", value: 35 },
                { label: "رتبه سوم استانی / اول منطقه / معادل (امتیاز ۳۰)", value: 30 },
                { label: "رتبه دوم منطقه / معادل (امتیاز ۲۵)", value: 25 },
                { label: "رتبه سوم منطقه / معادل (امتیاز 20)", value: 20 }
            ]
        }
    },
    {
        parent: "فعالیت‌های داوطلبانه و توسعه فردی",
        name: "تعداد شرکت در رویدادهای درون مدرسه‌ای",
        order: 6,
        description: "به ازای هر رویداد درون‌مدرسه‌ای. حداکثر امتیاز ۱۰.",
        valueInput: { type: "number", label: "تعداد رویداد درون‌مدرسه‌ای ", required: true, numberMin: 1},
        scoreDefinition: { inputType: "calculated_from_value", multiplier: 10, }
    },
    {
        parent: "فعالیت‌های داوطلبانه و توسعه فردی",
        name: "کسب رتبه در رویدادهای درون مدرسه‌ای",
        order: 7,
        description: "رتبه اول: +۳۰ / رتبه دوم: +۲۰ / رتبه سوم: +۱۰",
        valueInput: { type: "select", label: "رتبه کسب شده", required: true },
        scoreDefinition: {
            inputType: "select_from_enum",
            // valueInput.options قبلی: ["رتبه اول", "رتبه دوم", "رتبه سوم"]
            // scoreDefinition.enumOptions قبلی: [10, 20, 30]
            // با توجه به description، ترتیب امتیازها باید با لیبل‌ها مچ شود:
            enumOptions: [
                { label: "رتبه اول", value: 30 },
                { label: "رتبه دوم", value: 20 },
                { label: "رتبه سوم", value: 10 }
            ]
        }
    },
    // ردیف ۱۵ اکسل (تعداد شرکت در رویدادهای برون‌مدرسه‌ای) در فایل seed شما نبود، بر اساس اکسل اضافه می‌کنم:
    {
        parent: "فعالیت‌های داوطلبانه و توسعه فردی",
        name: "تعداد شرکت در رویدادهای برون مدرسه‌ای", // این نام از اکسل شما گرفته شده
        order: 8,
        description: "به ازای هر رویداد برون مدرسه‌ای. حداکثر امتیاز ۱۵.",
        valueInput: { type: "number", label: "تعداد رویداد برون مدرسه‌ای ", required: true, numberMin: 1,  },
        scoreDefinition: { inputType: "calculated_from_value", multiplier: 15,  }
    },
    // ردیف ۱۶ اکسل (کسب رتبه در رویدادهای برون‌مدرسه‌ای) در فایل seed شما نبود، بر اساس اکسل اضافه می‌کنم:
    {
        parent: "فعالیت‌های داوطلبانه و توسعه فردی",
        name: "کسب رتبه در رویدادهای برون مدرسه‌ای", // این نام از اکسل شما گرفته شده
        order: 9,
        description: "امتیاز بر اساس سطح رویداد برون مدرسه‌ای و رتبه. سطوح A و B.",
        valueInput: { type: "select", label: "رتبه و سطح رویداد برون مدرسه‌ای", required: true },
        scoreDefinition: {
            inputType: "select_from_enum",
            // enum در اکسل: "20, 25, 30, 35, 40"
            // شما باید لیبل‌های دقیق را برای هر امتیاز بر اساس description اکسل (رویداد سطح A و B) تعریف کنید.
            enumOptions: [
                { label: "رویداد سطح A - رتبه اول (امتیاز ۴۰)", value: 40 },
                { label: "رویداد سطح A  - رتبه دوم (امتیاز ۳۵)", value: 35 },
                { label: "رویداد سطح A - رتبه سوم / سطح B - رتبه اول (امتیاز ۳۰)", value: 30 },
                { label: "رویداد سطح B - رتبه دوم (امتیاز ۲۵)", value: 25 },
                { label: "رویداد سطح B - رتبه سوم (امتیاز 20)", value: 20 }
            ]
        }
    },
    {
        parent: "فعالیت‌های داوطلبانه و توسعه فردی",
        name: "تعداد شرکت در دوره‌های آموزشی برون مدرسه‌ای",
        order: 10,
        description: "به ازای هر دوره آموزشی برون‌مدرسه‌ای (زبان، ورزش و ...). حداکثر امتیاز ۱۰.",
        valueInput: { type: "number", label: "تعداد دوره‌های شرکت شده ", required: true, numberMin: 1,},
        scoreDefinition: { inputType: "calculated_from_value", multiplier: 10, } // اگر هر دوره ۱ امتیاز
        // اگر هر دوره ۲ امتیاز و سقف ۱۰ بود: multiplier: 2, valueInput.numberMax: 5
    },
    {
        parent: "فعالیت‌های داوطلبانه و توسعه فردی",
        name: "امتیاز در لیگ‌های درون مدرسه‌ای",
        order: 11,
        description: "امتیازات کسب‌شده در لیگ‌های ورزش و بازی",
        valueInput: { type: "number", label: "امتیاز در لیگ", required: true, numberMin: 20,},
        scoreDefinition: { inputType: "calculated_from_value", multiplier: 0.05,  } // اگر هر دوره ۱ امتیاز
    },

    // -------------------- موارد کسر امتیاز --------------------
    {
        parent: "موارد کسر امتیاز",
        name: "غیبت در کلاس",
        order: 1,
        description: "کسر به ازای هر بار غیبت کلاسی غیرموجه (-۱ امتیاز)",
        valueInput: { type: "number", label: "تعداد غیبت‌های غیرموجه", required: true, numberMin: 1 },
        scoreDefinition: { inputType: "calculated_from_value", multiplier: -1 }
    },
    {
        parent: "موارد کسر امتیاز",
        name: "تأخیر در کلاس",
        order: 2,
        description: "کسر به ازای هر بار تأخیر غیرموجه در کلاس (-۰.۵ امتیاز)",
        valueInput: { type: "number", label: "تعداد تأخیرهای غیرموجه", required: true, numberMin: 1 },
        scoreDefinition: { inputType: "calculated_from_value", multiplier: -0.5 }
    },
    {
        parent: "موارد کسر امتیاز",
        name: "سایر موارد انضباطی",
        order: 3,
        description: "کسر به ازای هر مورد انضباطی در کلاس یا مدرسه (-۲ امتیاز)",
        valueInput: { type: "number", label: "تعداد موارد انضباطی", required: true, numberMin: 1 },
        scoreDefinition: { inputType: "calculated_from_value", multiplier: -2 }
    }
];

dotenv.configDotenv({path:__dirname+'/config.env'})
    
const seedDB = async () => {
    try {
         mongoose.connect(process.env.DATA_BASE).then(()=>{
              console.log('database is connect')
          }).catch(err=>console.log(err))

        await Activity.deleteMany({}); // پاک کردن تمام فعالیت های موجود
        console.log('Old activities deleted.');

        await Activity.insertMany(activitiesData);
        console.log('New activities seeded successfully!');

    } catch (err) {
        console.error('Error seeding database:', err);
    } finally {
        await mongoose.disconnect();
        console.log('MongoDB Disconnected.');
    }
};

seedDB()