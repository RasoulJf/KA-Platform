import mongoose from "mongoose";

const isStudent = function () {
  return this.role === "student";
};

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String, 
      required: [true, "FullName is required"],
      trim: true,
    },
    role: {
      type: String,
      enum: ["student", "admin", "superAdmin"], 
      default: "student",
    },
    password: {
      type: String,
    },
    idCode: {
      type: String,
      required: [true, "IdCode is required"],
    },
    fieldOfStudy: {
      type: String,
      enum: ["تولید و توسعه پایگاه اینترنتی", "تولیدکننده چندرسانه‌ای"],
      required: [isStudent, "fieldOfStudy is required"],
    },
    grade: {
      type: String,
      enum: ["دهم", "یازدهم", "دوازدهم"],
      required: [isStudent, "Grade is required"],
    },
    class: {
      type: Number,
      enum: [101, 102, 103, 201, 202, 301, 302],
      required: [isStudent, "Class is required"],
    },
    score: { 
      type: Number,
      default: 0,
    },
    rankInSchool: {
      type: Number,
      default: null,
    }, 
    rankInGrade: {
      type: Number,
      default: null,
    },
    rankInClass: {
      type: Number,
      default: null,
    },
    token: {
      type: Number,
      default: 0,
    },
    activities: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "StudentActivity",
        },
      ],
    },
    rewards: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "StudentReward",
        },
      ],
    },
  },
  { timestamps: true, versionKey: false }
);

userSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (update.score !== undefined) {
    update.token = Math.floor(update.score * 0.95);
  }
  next();
});

userSchema.pre("save", function (next) {
  if (this.isModified('score') || this.isNew) { // شرط شما
    this.token = Math.floor(this.score * 0.95);
    console.log(`User pre-save hook: Score modified or new. User: ${this.fullName}, Score: ${this.score}, New Token: ${this.token}`);
  } else {
    console.log(`User pre-save hook: Score NOT modified. User: ${this.fullName}, Token before this hook: ${this.token}, Score: ${this.score}`);
    // آیا اینجا به اشتباه this.token = Math.floor(this.score * 0.95) رو دوباره انجام میدی؟
    // یا اینکه this.token در این لحظه هنوز مقدار قبلی (251) رو داره و save فقط همون رو ذخیره می‌کنه؟
  }
  next();
});

userSchema.post("findOneAndUpdate", async function (doc) {
  if (doc) {
    doc.token = Math.floor(doc.score * 0.95);
    await doc.save();
  }
});

const User = mongoose.model("User", userSchema);

export default User;
