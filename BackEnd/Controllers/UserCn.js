import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';
import catchAsync from '../Utils/catchAsync.js';
import HandleERROR from '../Utils/handleError.js';
import User from '../Models/UserMd.js';
import bcryptjs from 'bcryptjs';

export const uploadUsers = catchAsync(async (req, res, next) => {
  if (req.role !== "superAdmin") {
    return next(new HandleERROR("You don't have permission", 400));
  }

  if (!req.file) {
    return next(new HandleERROR("No file uploaded", 400));
  }

  try {
    // خواندن فایل اکسل
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const usersData = xlsx.utils.sheet_to_json(worksheet);

    // پردازش و ذخیره کاربران
    const processedUsers = await Promise.all(
      usersData.map(async (user) => {
        const { idCode, role, ...others } = user;
        
        let password;
        if (role === 'student') {
          password = `s${idCode}`;
        } else {
          password = `a${idCode}`;
        }
        
        const hashPass = await bcryptjs.hash(password, 10);
        
        return {
          ...others,
          idCode,
          password: hashPass,
          role
        };
      })
    );

    // ذخیره در دیتابیس
    await User.insertMany(processedUsers);

    // حذف فایل موقت
    fs.unlinkSync(req.file.path);

    return res.status(201).json({
      message: 'Users imported successfully',
      success: true,
      count: processedUsers.length
    });
  } catch (error) {
    // حذف فایل موقت در صورت خطا
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    return next(new HandleERROR(error.message, 500));
  }
});