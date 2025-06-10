// models/ActivityMd.js
import mongoose from "mongoose";

// یک sub-schema برای گزینه‌های شمارشی که هم لیبل دارند و هم مقدار
const EnumOptionWithLabelSchema = new mongoose.Schema({
    label: { type: String, required: true, trim: true },
    value: { type: Number, required: true }
}, {_id: false });

const activitySchema = new mongoose.Schema({
  parent: {
    type: String,
    enum: ['موارد کسر امتیاز', 'فعالیت‌های آموزشی', 'فعالیت‌های شغلی', 'فعالیت‌های داوطلبانه و توسعه فردی'],
    required: [true, "فیلد 'دسته بندی والد' الزامی است."],
  },
  order: { // <<<< فیلد جدید برای ترتیب نمایش
    type: Number,
    required: false, // یا true اگر می‌خواهید همیشه ست شود
    default: 0 // یا هر مقدار پیش‌فرض دیگر
},
  name: {
    type: String,
    required: [true, "فیلد 'نام فعالیت' الزامی است."],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  valueInput: {
    type: {
      type: String,
      enum: ['number', 'text', 'none', 'select'],
      required: [true, "نوع فیلد ورودی (valueInput.type) الزامی است."],
      default: 'text',
    },
    label: {
      type: String,
      default: 'جزئیات/مقدار',
      trim: true,
    },
    // فیلد 'options' اینجا حذف می‌شود چون برای type='select'، گزینه‌ها از scoreDefinition.enumOptions[].label خوانده می‌شوند.
    // اگر برای انواع دیگری از valueInput.type لازم است، می‌توانید نگه دارید و با validate مدیریت کنید.
    required: {
      type: Boolean,
      default: false,
    },
    numberMin: Number,
    numberMax: Number
  },
  scoreDefinition: {
    inputType: {
      type: String,
      enum: [
        'select_from_enum',
        'number_in_range',
        'calculated_from_value',
        'fixed_from_enum_single',
        'manual_number_entry',
      ],
      required: [true, "فیلد 'نحوه ورود/محاسبه امتیاز' (scoreDefinition.inputType) الزامی است."],
    },
    multiplier: {
      type: Number,
      validate: [
          function(val) {
              return this.inputType !== 'calculated_from_value' || (typeof val === 'number');
          },
          'فیلد multiplier برای calculated_from_value الزامی و باید عددی باشد.'
      ]
    },
    // این enumOptions حالا برای select_from_enum و fixed_from_enum_single ساختار {label, value} خواهد داشت
    // برای انواع دیگر (اگر قبلا استفاده می‌کردید و آرایه اعداد بود) باید مدیریت شود یا اصلا استفاده نشود.
    enumOptions: {
      type: [mongoose.Schema.Types.Mixed], // برای انعطاف در برابر داده‌های قدیمی یا انواع مختلف
      default: undefined,
      validate: [
          function(val) {
              const inputType = this.inputType;
              if (inputType === 'select_from_enum') {
                  return Array.isArray(val) && val.length > 0 && val.every(opt => typeof opt === 'object' && opt.label && typeof opt.value === 'number');
              }
              if (inputType === 'fixed_from_enum_single') {
                  return Array.isArray(val) && val.length === 1 && typeof val[0] === 'object' && val[0].label && typeof val[0].value === 'number';
              }
              // اگر برای انواع دیگری از inputType (مثلا سازگاری با داده‌های قدیمی که آرایه اعداد بود) می‌خواهید enumOptions عددی را مجاز بدانید:
              // if (inputType === 'some_other_type_expecting_numbers_array') {
              //    return Array.isArray(val) && val.every(item => typeof item === 'number');
              // }
              return true;
          },
          'ساختار enumOptions معتبر نیست. برای select_from_enum باید آرایه‌ای از {label,value} با حداقل یک آیتم باشد. برای fixed_from_enum_single باید آرایه‌ای از {label,value} با دقیقاً یک آیتم باشد.'
      ]
    },
    min: Number,
    max: Number,
  }
}, {
  timestamps: true,
  versionKey: false
});

activitySchema.index({ parent: 1, name: 1 }, { unique: true, collation: { locale: 'fa', strength: 2 } });
activitySchema.set('strict', 'throw');

activitySchema.pre('save', function(next) {
    const scoreDef = this.scoreDefinition;
    const valueIn = this.valueInput;

    if (scoreDef.inputType === 'calculated_from_value' && valueIn.type !== 'number') {
        return next(new Error("برای امتیاز محاسبه‌ای (calculated_from_value)، نوع ورودی مقدار (valueInput.type) باید 'number' باشد."));
    }
    if (valueIn.type === 'select' && scoreDef.inputType !== 'select_from_enum') {
        return next(new Error("اگر نوع ورودی مقدار (valueInput.type) برابر 'select' است، نحوه ورود امتیاز (scoreDefinition.inputType) باید 'select_from_enum' باشد."));
    }
    if (scoreDef.inputType === 'select_from_enum' && (!Array.isArray(scoreDef.enumOptions) || scoreDef.enumOptions.length === 0 || !scoreDef.enumOptions.every(opt => typeof opt === 'object' && opt.label && typeof opt.value === 'number'))) {
        return next(new Error("برای select_from_enum، فیلد scoreDefinition.enumOptions باید آرایه‌ای از آبجکت‌های {label, value} با حداقل یک آیتم باشد."));
    }
    if (scoreDef.inputType === 'fixed_from_enum_single' && (!Array.isArray(scoreDef.enumOptions) || scoreDef.enumOptions.length !== 1 || typeof scoreDef.enumOptions[0] !== 'object' || !scoreDef.enumOptions[0].label || typeof scoreDef.enumOptions[0].value !== 'number')) {
        return next(new Error("برای fixed_from_enum_single، فیلد scoreDefinition.enumOptions باید آرایه‌ای از یک آبجکت {label, value} باشد."));
    }
    next();
});

const Activity = mongoose.model('Activity', activitySchema);
export default Activity;