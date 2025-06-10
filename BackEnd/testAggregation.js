// testAggregation.js
import mongoose from 'mongoose';
import dotenv from 'dotenv'; // اگر از فایل .env برای متغیرهای محیطی استفاده می‌کنید
import User from './Models/UserMd.js'; // <<<< مسیر صحیح به مدل User خود را وارد کنید
import { __dirname } from "./app.js";


// بارگذاری متغیرهای محیطی (اگر دارید)
dotenv.configDotenv({path:__dirname+'/config.env'})

async function testAggregation() {
  const limitPerGrade = 4;

  console.log('Connecting to MongoDB...');
  // اتصال به MongoDB (آدرس اتصال را از تنظیمات خود بردارید)
  mongoose.connect(process.env.DATA_BASE).then(()=>{
      console.log('database is connect')
  }).catch(err=>console.log(err))

  try {
    console.log('\n--- Running Aggregation Test ---');

    // مرحله 1: $match
    console.log('\n--- Stage 1: $match ---');
    const matchStageResult = await User.aggregate([
      {
        $match: { role: 'student', grade: { $in: ['دهم', 'یازدهم', 'دوازدهم'] } }
      }
    ]).exec(); // اضافه کردن .exec() برای برگرداندن Promise واقعی
    console.log("After $match:", JSON.stringify(matchStageResult, null, 2));
    console.log(`Number of documents after $match: ${matchStageResult.length}`);
    if (matchStageResult.length === 0) {
      console.error("هیچ دانش‌آموزی با شرایط اولیه پیدا نشد! بررسی کنید مقادیر 'grade' و 'role' در دیتابیس صحیح باشند.");
      // return; // می‌توانید اینجا متوقف کنید یا ادامه دهید تا مراحل بعدی را هم ببینید
    }

    // مرحله 2: $sort
    console.log('\n--- Stage 2: $sort ---');
    const sortStageResult = await User.aggregate([
      { $match: { role: 'student', grade: { $in: ['دهم', 'یازدهم', 'دوازدهم'] } } },
      { $sort: { score: -1 } }
    ]).exec();
    console.log("After $sort (first 5):", JSON.stringify(sortStageResult.slice(0, 5), null, 2)); // نمایش ۵ تای اول برای خوانایی
    console.log(`Number of documents after $sort: ${sortStageResult.length}`);


    // مرحله 3: $group (اولیه، برای گروه بندی بر اساس پایه)
    console.log('\n--- Stage 3: First $group (by grade) ---');
    const group1StageResult = await User.aggregate([
      { $match: { role: 'student', grade: { $in: ['دهم', 'یازدهم', 'دوازدهم'] } } },
      { $sort: { score: -1 } },
      {
        $group: {
          _id: '$grade',
          students: { $push: { _id: '$_id', fullName: '$fullName', score: '$score' } },
          count: { $sum: 1 } // اضافه کردن شمارش برای هر گروه
        }
      }
    ]).exec();
    console.log("After first $group (by grade):", JSON.stringify(group1StageResult, null, 2));
    if (group1StageResult.length === 0) {
      console.error("گروه‌بندی بر اساس پایه نتیجه‌ای نداشت!");
    }

    // مرحله 4: $project (برای $slice کردن)
    console.log('\n--- Stage 4: $project (with $slice) ---');
    const projectStageResult = await User.aggregate([
      { $match: { role: 'student', grade: { $in: ['دهم', 'یازدهم', 'دوازدهم'] } } },
      { $sort: { score: -1 } },
      { $group: { _id: '$grade', students: { $push: { _id: '$_id', fullName: '$fullName', score: '$score' } } } },
      { $project: { _id: 1, topStudents: { $slice: ['$students', limitPerGrade] } } }
    ]).exec();
    console.log("After $project (with $slice):", JSON.stringify(projectStageResult, null, 2));

    // مرحله 5: $group (دوم، برای تبدیل به فرمت k-v)
    console.log('\n--- Stage 5: Second $group (k-v format) ---');
    const group2StageResult = await User.aggregate([
      { $match: { role: 'student', grade: { $in: ['دهم', 'یازدهم', 'دوازدهم'] } } },
      { $sort: { score: -1 } },
      { $group: { _id: '$grade', students: { $push: { _id: '$_id', fullName: '$fullName', score: '$score' } } } },
      { $project: { _id: 1, topStudents: { $slice: ['$students', limitPerGrade] } } },
      {
        $group: {
          _id: null,
          gradesData: { $push: { k: '$_id', v: '$topStudents' } }
        }
      }
    ]).exec();
    console.log("After second $group (k-v format):", JSON.stringify(group2StageResult, null, 2));
    if (group2StageResult.length === 0 || !group2StageResult[0]?.gradesData || group2StageResult[0].gradesData.length === 0) {
      console.error("مرحله دوم گروه بندی نتیجه مورد انتظار (آرایه gradesData پر) را نداد!");
    }

    // مرحله 6: $replaceRoot (کل پایپ‌لاین)
    console.log('\n--- Stage 6: Full Pipeline with $replaceRoot ---');
    const fullPipelineResult = await User.aggregate([
      { $match: { role: 'student', grade: { $in: ['دهم', 'یازدهم', 'دوازدهم'] } } },
      { $sort: { score: -1 } },
      { $group: { _id: '$grade', students: { $push: { _id: '$_id', fullName: '$fullName', score: '$score' } } } },
      { $project: { _id: 1, topStudents: { $slice: ['$students', limitPerGrade] } } },
      { $group: {  _id: null, gradesData: { $push: { k: '$_id', v: '$topStudents' } } } },
      { $replaceRoot: { newRoot: { $cond: { 
          if: { $or: [ { $eq: ["$gradesData", null] }, { $eq: [{ $size: "$gradesData" }, 0] } ] }, 
          then: {}, 
          else: { $arrayToObject: '$gradesData' } 
      } } } }
    ]).exec();
    // fullPipelineResult باید آرایه‌ای با یک عضو (آبجکت نهایی) یا آرایه خالی باشد
    console.log("After $replaceRoot (Full Pipeline):", JSON.stringify(fullPipelineResult[0] || {}, null, 2)); // نمایش آبجکت اول یا آبجکت خالی

    // نتیجه نهایی که به فرانت ارسال می‌شود
    const finalResultForFrontend = {
        'دهم': (fullPipelineResult[0] && fullPipelineResult[0]['دهم']) || [],
        'یازدهم': (fullPipelineResult[0] && fullPipelineResult[0]['یازدهم']) || [],
        'دوازدهم': (fullPipelineResult[0] && fullPipelineResult[0]['دوازدهم']) || [],
    };
    console.log("\n--- Final structure for frontend ---");
    console.log(JSON.stringify(finalResultForFrontend, null, 2));


  } catch (err) {
    console.error('Error during aggregation test:', err);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
}

testAggregation().catch(err => {
  console.error('Unhandled error in testAggregation:', err);
  process.exit(1); // خروج با خطا
});