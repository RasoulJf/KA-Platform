import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Activity from './Models/ActivityMd.js'; // مطمئن شوید مسیر به مدل شما صحیح است
import { __dirname } from "./app.js"; // اگر از __dirname به این شکل استفاده می‌کنید
import User from './Models/UserMd.js';

dotenv.configDotenv({path:__dirname+'/config.env'})
    
const seedDB = async () => {
    try {
         mongoose.connect(process.env.DATA_BASE).then(()=>{
              console.log('database is connect')
          }).catch(err=>console.log(err))

          await User.updateMany(
            {}, // فیلتر: همه داکیومنت‌ها (یا { role: "student" } برای فقط دانش‌آموزان)
            {
              $set: {
                activities: [],     // خالی کردن آرایه activities
                rewards: [],        // خالی کردن آرایه rewards
                score: 0,           // ریست کردن score به صفر
                token: 0,           // ریست کردن token به صفر (یا طبق منطق score * 0.95 اگر score اولیه صفر باشه)
                rankInSchool: null, // ریست کردن رتبه‌ها
                rankInGrade: null,
                rankInClass: null
              }
            }
          );

          console.log('Reset User successfully!');




    } catch (err) {
        console.error('Error seeding database:', err);
    } finally {
        await mongoose.disconnect();
        console.log('MongoDB Disconnected.');
    }
};

seedDB()