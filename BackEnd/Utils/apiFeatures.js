// در فایل ApiFeatures.js
class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
    this.appliedFilters = {}; // پراپرتی جدید برای نگهداری فیلترها
  }

  filter() {
    const queryObj = { ...this.queryString };
    const fieldsItems = ["page", "limit", "sort", "fields", "populate", "search"]; // populate و search هم اضافه شد
    fieldsItems.forEach((el) => delete queryObj[el]);

    // اگر queryObj.filters وجود دارد و یک آبجکت است، از آن استفاده کن
    // در غیر این صورت، خود queryObj (پس از حذف فیلدهای خاص) را به عنوان فیلتر در نظر بگیر
    // این بستگی به نحوه ارسال فیلترها از فرانت‌اند دارد
    // اگر همیشه فیلترها داخل یک آبجکت filters هستند:
    if (queryObj.filters && typeof queryObj.filters === 'object') {
        this.appliedFilters = { ...queryObj.filters };
    } else {
    // اگر فیلترها مستقیماً در query string هستند (مثلاً status=approved&userId=...)
        this.appliedFilters = { ...queryObj };
    }
    
    this.query = this.query.find(this.appliedFilters);
    return this;
  }

  // متد جدید برای گرفتن فیلترهای اعمال شده
  getQueryFilters() {
    return this.appliedFilters;
  }

  sort() {
    // ... (بدون تغییر)
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  limitFields() {
    // ... (بدون تغییر)
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }

  paginate() {
    // ... (بدون تغییر)
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100; // حد پیش‌فرض اگر لازم است
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

  search(){
    // ... (بدون تغییر)
    if (this.queryString.search) {
        // ...
    }
    return this
  }

  populate() {
    if (this.queryString.populate) {
      const populateOptions = this.queryString.populate.split(',').map(field => {
        const trimmedField = field.trim();
        // اگر می‌خواهید برای هر فیلد، فیلدهای خاصی را select کنید، اینجا منطقش را اضافه کنید
        // مثال:
        // if (trimmedField === 'userId') return { path: 'userId', select: 'fullName role' };
        // if (trimmedField === 'activityId') return { path: 'activityId', select: 'name parent type' };
        return { path: trimmedField }; // ساده‌ترین حالت، populate کردن کل داکیومنت
      });
      this.query = this.query.populate(populateOptions);
    }
    return this;
  }

  secondPopulate(x) {
    // ... (بدون تغییر)
    return this;
  }
}
export default ApiFeatures;