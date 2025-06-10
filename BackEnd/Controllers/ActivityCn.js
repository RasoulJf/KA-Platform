import Activity from "../Models/ActivityMd.js";
import catchAsync from "../Utils/catchAsync.js";
import ApiFeatures from "../Utils/apiFeatures.js";
import HandleERROR from "../Utils/handleError.js"; // اگر HandleERROR را لازم دارید و import نشده

export const createActivity=catchAsync(async(req,res,next)=>{
    const activity=await Activity.create(req.body)
    return res.status(201).json({
        success:true,
        message: "activity created successfully",
        data:activity
    })
})
export const getAllActivities=catchAsync(async(req,res,next)=>{
    const features=new ApiFeatures(Activity,req.query)
    .sort()
    .populate()
    .filter()
    .limitFields()
    const activities=await features.query
    return res.status(200).json({
        success:true,
        data:activities
    })
})
export const getOneActivity=catchAsync(async(req,res,next)=>{
    const {id}=req.params
    const activity=await Activity.findById(id)
    return res.status(200).json({
        data:activity,
        success:true
    })
})
export const removeActivity=catchAsync(async(req,res,next)=>{
    const {id}=req.params
    await Activity.findByIdAndDelete(id)
    return res.status(200).json({
        success:true,
        message:"activity removed successfully"
    })
})

export const findActivityByDetails = catchAsync(async (req, res, next) => {
    const { parent, name } = req.query; // name همان title از فرم است
    if (!parent || !name) {
      return next(new HandleERROR('دسته‌بندی و عنوان فعالیت الزامی است.', 400));
    }
    const activity = await Activity.findOne({
      parent,
      name: { $regex: `^${name.trim()}$`, $options: 'i' }
    }).select('_id name parent');
  
    if (!activity) {
      return next(new HandleERROR('فعالیتی با این مشخصات یافت نشد.', 404));
    }
    res.status(200).json({ success: true, data: activity });
  });



  // Controllers/ActivityCn.js
// ... (سایر import ها و توابع موجود) ...

// Controllers/ActivityCn.js
export const getActivitiesByParent = catchAsync(async (req, res, next) => {
    // پارامتر parent از query string خوانده می‌شود (مثال: /api/activity/by-parent?parent=فعالیت‌های%۲۰آموزشی)
    const { parent: parentCategory } = req.query;

    if (!parentCategory) {
        return res.status(400).json({ success: false, message: 'دسته بندی والد فعالیت (پارامتر parent در query string) الزامی است.' });
    }

    const activities = await Activity.find({ parent: parentCategory })
                                     .sort({ order: 1, name: 1 }) // مرتب‌سازی اولیه بر اساس فیلد order، سپس بر اساس نام
                                     .lean(); // .lean() برای پرفورمنس بهتر چون فقط برای نمایش است

    res.status(200).json({
        success: true,
        data: activities,
    });
});