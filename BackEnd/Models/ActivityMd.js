import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  parent: {
    type: String,
    enum:['فعالیت‌های آموزشی','فعالیت‌های شغلی','فعالیت‌های داوطلبانه','فعالیت‌های توسعه فردی'],
    required: true,
  },
  name: {
    type:String,
    required:[true,'Activity name is required'] 
  },
  description: String,
});

const Activity = mongoose.model('Activity',activitySchema)

export default Activity