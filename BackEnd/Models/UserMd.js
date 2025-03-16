import mongoose from "mongoose";

const isStudent = function () {
  return this.role === 'Student';
};

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'FullName is required'],
        trim: true
    },
    role: {
        type: String,
        enum: ['Student', 'Admin', 'SuperAdmin'],
        default: 'Student'
    },
    idCode: {
        type: String,
        required: [true, 'IdCode is required'],
        match: [/^(?!0{10})\d{10}$/, 'IdCode is not valid']
    },
    fieldOfStudy: {
        type: String,
        enum: ['تولید و توسعه پایگاه‌های اینترنتی', 'تولید محتوای چند رسانه‌ای'],
        required: [isStudent, 'fieldOfStudy is required']
    },
    grade: {
        type: String,
        enum: ['دهم', 'یازدهم', 'دوازدهم'],
        required: [isStudent, 'Grade is required']
    },
    class: {
        type: Number,
        enum: [101, 102, 103, 201, 202, 301, 302],
        required: [isStudent, 'Class is required']
    },
    score: {
        type: Number,
        default: 0
    },
    activities: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'StudentActivity'
        }]
    },
    rewards: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'StudentReward'
        }]
    }
}, { timestamps: true, versionKey: false });

const User = mongoose.model('User', userSchema);

export default User;
