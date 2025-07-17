import catchAsync from '../Utils/catchAsync.js';
import User from '../Models/UserMd.js';
import ApiFeatures from '../Utils/apiFeatures.js';
import HandleERROR from '../Utils/handleError.js';
import AdminActivity from '../Models/AdminActivityMd.js';
import StudentActivity from '../Models/StudentActivityMd.js';
import Activity from '../Models/ActivityMd.js';



// userController.js
export const getUserSummaryStats = catchAsync(async (req, res, next) => {
  const stats = await User.aggregate([
    { $match: { role: 'student' } },
    { $group: { _id: null, totalScore: { $sum: '$score' } } },
    { $project: { _id: 0, totalScore: 1 } }
  ]);
  res.status(200).json({ success: true, data: stats[0] || { totalScore: 0 } });
});

export const getAllStudentsForSelection = catchAsync(async (req, res, next) => {
  // دریافت پارامترهای فیلتر از query string
  const { grade } = req.query;
  
  // ساخت شرط فیلتر اولیه
  const filter = { role: 'student' };
  
  // اضافه کردن فیلتر پایه اگر وجود داشت
  if (grade && ['دهم', 'یازدهم', 'دوازدهم'].includes(grade)) {
    filter.grade = grade;
  }

  // ساخت کوئری با امکان فیلتر، مرتب‌سازی و صفحه‌بندی
  const features = new ApiFeatures(
    User.find(filter).select('_id fullName grade class'), // فقط فیلدهای مورد نیاز
    req.query
  )
    .sort('fullName') // پیش‌فرض مرتب‌سازی بر اساس نام
    .limitFields() // فقط فیلدهای انتخاب شده در select
    .paginate(); // صفحه‌بندی اختیاری

  const students = await features.query;
  
  // تبدیل به فرمت مناسب برای dropdown
  const studentsForDropdown = students.map(student => ({
    value: student._id,
    label: `${student.fullName} - پایه ${student.grade} - کلاس ${student.class || 'نامشخص'}`,
    rawData: student // در صورت نیاز به تمام اطلاعات
  }));

  res.status(200).json({
    success: true,
    results: students.length,
    data: studentsForDropdown
  });
});


export const findStudentByDetails = catchAsync(async (req, res, next) => {
  const { fullName, grade, class: studentClass } = req.query; // class کلمه کلیدی است
  if (!fullName || !grade || !studentClass) {
    return next(new HandleERROR('نام کامل، پایه و کلاس دانش‌آموز الزامی است.', 400));
  }
  const student = await User.findOne({
    fullName: { $regex: `^${fullName.trim()}$`, $options: 'i' }, // جستجوی دقیق و بدون حساسیت به حروف
    grade,
    class: parseInt(studentClass),
    role: 'student'
  }).select('_id fullName');

  if (!student) {
    return next(new HandleERROR('دانش‌آموزی با این مشخصات یافت نشد.', 404));
  }
  res.status(200).json({ success: true, data: student });
});





export const getTopStudentsByAllGrades = catchAsync(async (req, res, next) => {
  const limitPerGrade = parseInt(req.query.limit) || 4;

  // نام متغیر را به aggregationPipelineResult تغییر می‌دهیم تا واضح‌تر باشد
  const aggregationPipelineResult = await User.aggregate([
    {
      $match: { role: 'student', grade: { $in: ['دهم', 'یازدهم', 'دوازدهم'] } }
    },
    {
      $sort: { score: -1 }
    },
    {
      $group: {
        _id: '$grade',
        students: { $push: { _id: '$_id', fullName: '$fullName', score: '$score' } }
      }
    },
    {
      $project: {
        _id: 1,
        topStudents: { $slice: ['$students', limitPerGrade] }
      }
    },
    {
      $group: {
        _id: null,
        gradesData: { $push: { k: '$_id', v: '$topStudents' } }
      }
    },
    {
      $replaceRoot: {
        newRoot: {
          $cond: {
            if: { $or: [ { $eq: ["$gradesData", null] }, { $eq: [{ $size: "$gradesData" }, 0] } ] },
            then: {},
            else: { $arrayToObject: '$gradesData' }
          }
        }
      }
    }
  ]);

  // aggregationPipelineResult یک آرایه است.
  // آبجکت داده‌های ما (اگر وجود داشته باشد) در اولین عضو این آرایه است.
  // اگر پایپ‌لاین هیچ نتیجه‌ای از $match اولیه پیدا نکند، aggregationPipelineResult آرایه خالی [] خواهد بود.
  // اگر نتیجه‌ای باشد ولی پس از $replaceRoot آبجکت خالی {} تولید شود، aggregationPipelineResult می‌شود [{}]
  

  const actualData = (aggregationPipelineResult.length > 0) ? aggregationPipelineResult[0] : {};

  // حالا result را از actualData می‌سازیم
  const result = {
    'دهم': actualData['دهم'] || [],
    'یازدهم': actualData['یازدهم'] || [],
    'دوازدهم': actualData['دوازدهم'] || [],
  };

  res.status(200).json({
    success: true,
    data: result, // ارسال result که حالا باید داده‌های صحیح را داشته باشد
  });
});



// Controllers/UserCn.js
// ... (سایر import ها و توابع موجود) ...

export const getStudentsByGradeAndClass = catchAsync(async (req, res, next) => {
  const { grade, classNum } = req.query;

  if (!grade || !classNum) {
      return next(new HandleERROR("پارامترهای 'پایه' و 'کلاس' الزامی هستند.", 400));
  }

  // تبدیل classNum به عدد، چون در مدل User به صورت Number ذخیره شده است
  const classNumber = parseInt(classNum, 10);
  if (isNaN(classNumber)) {
      return next(new HandleERROR("مقدار 'کلاس' باید یک عدد معتبر باشد.", 400));
  }

  const students = await User.find({
      role: 'student', // اطمینان از اینکه فقط دانش آموزان انتخاب می شوند
      grade: grade,
      class: classNumber,
  }).select('_id fullName'); // فقط _id و fullName را برای دراپ داون نیاز داریم

  // حتی اگر دانش آموزی یافت نشود، پاسخ موفقیت آمیز با آرایه خالی ارسال می کنیم
  // تا فرانت اند بتواند به درستی پیام "دانش آموزی یافت نشد" را نمایش دهد
  res.status(200).json({
      success: true,
      data: students, // students آرایه ای از دانش آموزان خواهد بود یا آرایه خالی []
  });
});

// RankingCn.js (یا UserCn.js)


export const getOverallRankingTable = catchAsync(async (req, res, next) => {
    // --- مرحله ۱: گرفتن تمام کاربران دانش‌آموز با امتیازات کلی و رتبه‌ها ---
    // می‌توانیم از ApiFeatures برای فیلتر کردن کاربران (مثلاً بر اساس پایه یا کلاس) و صفحه‌بندی استفاده کنیم
    let userQuery = User.find({ role: 'student' })
                        .select('fullName class score rankInSchool activities') // فیلدهای لازم از User
                        .sort({ rankInSchool: 1, score: -1 }); // مرتب‌سازی بر اساس رتبه مدرسه، سپس امتیاز

    // اگر ApiFeatures برای فیلتر و صفحه‌بندی کاربران استفاده می‌شود:
    const features = new ApiFeatures(userQuery, req.query)
        .filter()   // فیلتر مثلا بر اساس req.query.grade یا req.query.class
        .paginate()
        .sort();  // اگر sort پیش‌فرض بالا کافی نیست

    const users = await features.query.lean(); // .lean() برای پرفورمنس
    const totalUsers = await User.countDocuments(features.getQueryFilters ? features.getQueryFilters() : { role: 'student', ...req.query.filters });


    // --- مرحله ۲: برای هر کاربر، مجموع امتیازات را در دسته‌های مختلف فعالیت محاسبه کن ---
    const resultsPromises = users.map(async (user) => {
        const userObjectId = user._id; // _id از کاربر فعلی در حلقه

        // مجموع امتیازات از AdminActivity
        const adminActivitiesScores = await AdminActivity.aggregate([
            { $match: { userId: userObjectId } },
            { $lookup: { from: Activity.collection.name, localField: 'activityId', foreignField: '_id', as: 'activityDetails' } },
            { $unwind: '$activityDetails' }, // فرض می‌کنیم همیشه activityDetails وجود دارد
            { $group: { _id: '$activityDetails.parent', totalScore: { $sum: '$scoreAwarded' } } },
            { $project: { _id: 0, parentName: '$_id', totalScore: 1 } }
        ]);

        // مجموع امتیازات از StudentActivity (فقط تایید شده)
        const studentActivitiesScores = await StudentActivity.aggregate([
            { $match: { userId: userObjectId, status: 'approved' } },
            { $lookup: { from: Activity.collection.name, localField: 'activityId', foreignField: '_id', as: 'activityDetails' } },
            { $unwind: '$activityDetails' },
            { $group: { _id: '$activityDetails.parent', totalScore: { $sum: '$scoreAwarded' } } },
            { $project: { _id: 0, parentName: '$_id', totalScore: 1 } }
        ]);

        // ترکیب امتیازات
        const scoresByParent = {};
        adminActivitiesScores.forEach(item => {
            if(item.parentName) scoresByParent[item.parentName] = (scoresByParent[item.parentName] || 0) + item.totalScore;
        });
        studentActivitiesScores.forEach(item => {
            if(item.parentName) scoresByParent[item.parentName] = (scoresByParent[item.parentName] || 0) + item.totalScore;
        });

        return {
            id: user._id.toString(), // یا هر شناسه منحصر به فرد دیگر
            name: user.fullName,
            class: user.class ? user.class.toString() : 'نامشخص', // تبدیل به رشته اگر عدد است
            educationalActivities: scoresByParent['فعالیت‌های آموزشی'] || 0,
            voluntaryActivities: scoresByParent['فعالیت‌های داوطلبانه و توسعه فردی'] || 0,
            jobActivities: scoresByParent['فعالیت‌های شغلی'] || 0,
            deductions: scoresByParent['موارد کسر امتیاز'] || 0, // این معمولاً منفی است
            score: user.score, // امتیاز کل از مدل User
            rank: user.rankInSchool || user.rankInGrade || user.rankInClass || 'N/A', // انتخاب رتبه مناسب
        };
    });

    const resultsTableData = await Promise.all(resultsPromises);

    res.status(200).json({
        success: true,
        results: resultsTableData.length,
        totalCount: totalUsers,
        data: resultsTableData
    });
});

// UserCn.js یا RankingCn.js



// ثابت‌های PARENT_NAMES برای دسترسی به امتیازات دسته‌بندی شده
const EDUCATIONAL_ACTIVITIES = 'فعالیت‌های آموزشی';
const VOLUNTARY_ACTIVITIES = 'فعالیت‌های داوطلبانه و توسعه فردی';
const JOB_ACTIVITIES = 'فعالیت‌های شغلی';
const DEDUCTIONS = 'موارد کسر امتیاز';

export const getSameGradeRankingTable = catchAsync(async (req, res, next) => {
    const currentUserId = req.userId; // از میدل‌ور isLogin میاد

    // ۱. پیدا کردن پایه (grade) کاربر لاگین شده
    const currentUser = await User.findById(currentUserId).select('grade').lean();
    if (!currentUser || !currentUser.grade) {
        // اگر کاربر پایه نداشت یا پیدا نشد، یک آرایه خالی یا پیام خطا برگردان
        return res.status(200).json({
            success: true,
            message: "پایه تحصیلی شما مشخص نیست یا دانش‌آموزی با این پایه یافت نشد.",
            results: 0,
            totalCount: 0,
            data: []
        });
    }
    const userGrade = currentUser.grade;

    // ۲. گرفتن تمام کاربران هم‌پایه با کاربر فعلی
    // مرتب‌سازی بر اساس رتبه در پایه (rankInGrade) و سپس امتیاز (score)
    let userQuery = User.find({ role: 'student', grade: userGrade })
                        .select('fullName class score rankInGrade activities') // فیلدهای لازم
                        .sort({ rankInGrade: 1, score: -1 }); // rankInGrade صعودی، score نزولی

    // ۳. اعمال صفحه‌بندی با ApiFeatures (اگر لازم است)
    const features = new ApiFeatures(userQuery, req.query)
        .paginate(); // فقط صفحه‌بندی، فیلتر و سورت قبلاً اعمال شده

    const usersInSameGrade = await features.query.lean();
    const totalUsersInGrade = await User.countDocuments({ role: 'student', grade: userGrade });

    if (!usersInSameGrade || usersInSameGrade.length === 0) {
        return res.status(200).json({
            success: true,
            message: `دانش‌آموزی در پایه ${userGrade} یافت نشد.`,
            results: 0,
            totalCount: 0,
            data: []
        });
    }

    // ۴. محاسبه امتیازات دسته‌بندی شده برای هر کاربر هم‌پایه
    const resultsPromises = usersInSameGrade.map(async (user) => {
        const userObjectId = user._id;

        // این بخش می‌تواند با یک $lookup و $group پیچیده‌تر در یک aggregation واحد بهینه‌تر شود
        // اما برای خوانایی فعلاً جداگانه انجام می‌دهیم.
        const adminActivitiesScores = await AdminActivity.aggregate([
            { $match: { userId: userObjectId } },
            { $lookup: { from: Activity.collection.name, localField: 'activityId', foreignField: '_id', as: 'actDetails' } },
            { $unwind: { path: '$actDetails', preserveNullAndEmptyArrays: true } }, // برای جلوگیری از حذف اگر لینک خراب بود
            { $match: { "actDetails.parent": { $exists: true, $ne: null } } }, // فقط آنهایی که parent معتبر دارند
            { $group: { _id: '$actDetails.parent', totalScore: { $sum: '$scoreAwarded' } } }
        ]);

        const studentActivitiesScores = await StudentActivity.aggregate([
            { $match: { userId: userObjectId, status: 'approved' } },
            { $lookup: { from: Activity.collection.name, localField: 'activityId', foreignField: '_id', as: 'actDetails' } },
            { $unwind: { path: '$actDetails', preserveNullAndEmptyArrays: true } },
            { $match: { "actDetails.parent": { $exists: true, $ne: null } } },
            { $group: { _id: '$actDetails.parent', totalScore: { $sum: '$scoreAwarded' } } }
        ]);

        const scoresByParent = {};
        adminActivitiesScores.forEach(item => {
            if(item._id) scoresByParent[item._id] = (scoresByParent[item._id] || 0) + item.totalScore;
        });
        studentActivitiesScores.forEach(item => {
            if(item._id) scoresByParent[item._id] = (scoresByParent[item._id] || 0) + item.totalScore;
        });

        return {
            id: user._id.toString(),
            name: user.fullName,
            class: user.class ? user.class.toString() : 'نامشخص',
            educationalActivities: scoresByParent[EDUCATIONAL_ACTIVITIES] || 0,
            voluntaryActivities: scoresByParent[VOLUNTARY_ACTIVITIES] || 0,
            jobActivities: scoresByParent[JOB_ACTIVITIES] || 0,
            deductions: scoresByParent[DEDUCTIONS] || 0,
            score: user.score,
            rank: user.rankInGrade || 'N/A', // رتبه در پایه
        };
    });

    const resultsTableData = await Promise.all(resultsPromises);

    res.status(200).json({
        success: true,
        results: resultsTableData.length,
        totalCount: totalUsersInGrade,
        data: resultsTableData
    });
});


// UserCn.js یا RankingCn.js

// ... (ایمپورت‌ها و ثابت‌ها مثل قبل) ...

// UserCn.js

// ... (ایمپورت‌ها و ثابت‌های EDUCATIONAL_ACTIVITIES و ... مثل قبل) ...

// UserCn.js

// ... (ایمپورت‌ها و ثابت‌های EDUCATIONAL_ACTIVITIES و ... مثل قبل) ...

export const getGradeRankingTable = catchAsync(async (req, res, next) => {
  let targetGrade = req.query.grade;

  // ---- بخش بررسی targetGrade و currentUser مثل قبل ----
  if (!targetGrade && req.role === 'student') {
      const currentUser = await User.findById(req.userId).select('grade').lean();
      if (!currentUser || !currentUser.grade) {
          return res.status(400).json({ success: false, message: "پایه تحصیلی برای فیلتر کردن مشخص نشده است." });
      }
      targetGrade = currentUser.grade;
  } else if (!targetGrade) {
       return res.status(400).json({ success: false, message: "لطفاً یک پایه برای نمایش جدول انتخاب کنید." });
  }
  const validGrades = ['دهم', 'یازدهم', 'دوازدهم'];
  if (!validGrades.includes(targetGrade)) {
      return res.status(400).json({ success: false, message: "پایه انتخاب شده معتبر نیست." });
  }
  // ---- پایان بخش بررسی targetGrade ----


  // ---- بخش گرفتن کاربران و صفحه‌بندی مثل قبل ----
  let userQuery = User.find({ role: 'student', grade: targetGrade })
                      .select('fullName class score rankInGrade activities')
                      .sort({ rankInGrade: 1, score: -1 });
  const features = new ApiFeatures(userQuery, req.query).paginate();
  const usersInGrade = await features.query.lean();
  const totalUsersInGrade = await User.countDocuments(features.getQueryFilters ? features.getQueryFilters() : { role: 'student', grade: targetGrade });

  if (!usersInGrade || usersInGrade.length === 0) {
      return res.status(200).json({
          success: true, message: `دانش‌آموزی در پایه ${targetGrade} یافت نشد.`,
          results: 0, totalCount: 0, data: []
      });
  }
  // ---- پایان بخش گرفتن کاربران ----


  // console.log("--- DEBUG: Inside getGradeRankingTable (with AGGREGATES BYPASSED) ---"); // <<<< لاگ جدید
  // console.log("Target Grade:", targetGrade);
  // console.log(`Found ${usersInGrade.length} users in this grade.`);


  // ۴. محاسبه امتیازات دسته‌بندی شده برای هر کاربر هم‌پایه
  const resultsPromises = usersInGrade.map(async (user) => {
    const userObjectId = user._id;
    // console.log(`Processing user: ${user.fullName} (ID: ${userObjectId})`); // این لاگ رو نگه دار

    // !!!!!!! تغییر مهم برای دیباگ: موقتاً aggregation ها رو با آرایه خالی جایگزین می‌کنیم !!!!!!!
    const adminActivitiesScores = []; // <--- موقتاً خالی
    const studentActivitiesScores = []; // <--- موقتاً خالی
    // console.log(`   Temporarily set adminActivitiesScores and studentActivitiesScores to empty for user ${user.fullName}`); // این لاگ رو نگه دار
    // !!!!!!! پایان تغییر مهم !!!!!!!


    const scoresByParent = {};
    adminActivitiesScores.forEach(item => {
        if(item._id) scoresByParent[item._id] = (scoresByParent[item._id] || 0) + item.totalScore;
    });
    studentActivitiesScores.forEach(item => {
        if(item._id) scoresByParent[item._id] = (scoresByParent[item._id] || 0) + item.totalScore;
    });
    // console.log(`   scoresByParent for user ${user.fullName}:`, scoresByParent); // این لاگ رو نگه دار

    return {
        id: user._id.toString(),
        name: user.fullName,
        class: user.class ? user.class.toString() : 'نامشخص',
        educationalActivities: scoresByParent[EDUCATIONAL_ACTIVITIES] || 0,
        voluntaryActivities: scoresByParent[VOLUNTARY_ACTIVITIES] || 0,
        jobActivities: scoresByParent[JOB_ACTIVITIES] || 0,
        deductions: scoresByParent[DEDUCTIONS] || 0,
        score: user.score,
        rank: user.rankInGrade || 'N/A',
    };
  });

  const resultsTableData = await Promise.all(resultsPromises);
  // console.log("--- DEBUG: Final resultsTableData (before sending, aggregates bypassed) ---"); // <<<< لاگ جدید
  // console.log(JSON.stringify(resultsTableData.slice(0,2), null, 2));

  res.status(200).json({
      success: true,
      results: resultsTableData.length,
      totalCount: totalUsersInGrade,
      data: resultsTableData
  });
});

// ... (بقیه کنترلرهای UserCn.js مثل قبل) ...