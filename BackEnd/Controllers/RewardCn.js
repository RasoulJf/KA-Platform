import Reward from "../Models/RewardMd.js";
import catchAsync from "../Utils/catchAsync.js";
import ApiFeatures from "../Utils/apiFeatures.js";

export const createReward=catchAsync(async(req,res,next)=>{
    const reward=await Reward.create(req.body)
    return res.status(201).json({
        success:true,
        message: "reward created successfully",
        data:reward
    })
})
export const getAllRewards = catchAsync(async (req, res, next) => {
    // <<<< اصلاح: پاس دادن Reward.find() به جای Reward
    const features = new ApiFeatures(Reward.find(), req.query) // یا Reward.find({})
        .filter()       // ۱. فیلترها اول اعمال شوند
        .sort()         // ۲. سپس مرتب‌سازی
        .limitFields()  // ۳. سپس انتخاب فیلدها
        .populate()     // ۴. سپس populate (اگر قبل از paginate باشد بهتر است)
        // .paginate()  // ۵. و در نهایت صفحه‌بندی (اگر getAllRewards نیاز به صفحه‌بندی دارد)
                        // اگر صفحه‌بندی لازم نیست، این خط را حذف کنید یا در ApiFeatures مدیریت کنید

    const rewards = await features.query; // features.query اینجا باید نتیجه نهایی باشد

    // اگر از paginate استفاده می‌کنید، معمولاً totalCount هم لازم است
    // let totalCount;
    // if (req.query.page || req.query.limit) { // فقط اگر صفحه‌بندی فعال است
    //     const countFeatures = new ApiFeatures(Reward.find(), req.query).filter();
    //     totalCount = await Reward.countDocuments(countFeatures.getQueryFilters());
    // }

    return res.status(200).json({
        success: true,
        // results: rewards.length, // اگر صفحه‌بندی دارید
        // totalCount,              // اگر صفحه‌بندی دارید
        data: rewards
    });
});
export const getOneReward=catchAsync(async(req,res,next)=>{
    const {id}=req.params
    const reward=await Reward.findById(id)
    return res.status(200).json({
        data:reward,
        success:true
    })
})
export const removeReward=catchAsync(async(req,res,next)=>{
    const {id}=req.params
    await Reward.findByIdAndDelete(id)
    return res.status(200).json({
        success:true,
        message:"reward removed successfully"
    })
})