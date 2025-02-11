import moment from 'moment-timezone'

// متغیرهای سراسری جهت ذخیره زمان مرجع دریافتی از بک‌اند و زمان سیستم در لحظه دریافت
let referenceTime = null // زمان رسمی تهران دریافتی از بک‌اند (به عنوان یک شیء moment)
let fetchLocalTime = null // زمان سیستم (local) در لحظه دریافت زمان از بک‌اند

/**
 * دریافت زمان رسمی از بک‌اند و به‌روزرسانی متغیرهای referenceTime و fetchLocalTime.
 * فرض بر این است که endpoint '/api/get_iran_time' یک JSON به صورت زیر برمی‌گرداند:
 * { "currentTime": "2025-02-09 13:42:41+03:30" }
 */
async function updateReferenceTime() {
  try {
    const response = await fetch('/api/get_iran_time')
    const data = await response.json()
    // تبدیل رشته زمان دریافتی به شیء moment با ناحیه زمانی 'Asia/Tehran'
    // فرض می‌شود فرمت زمان دریافتی "YYYY-MM-DD HH:mm:ss" باشد (با offset هم، مانند "2025-02-09 13:42:41+03:30")
    const fetchedReferenceTime = moment.tz(
      data.currentTime,
      'YYYY-MM-DD HH:mm:ssZ',
      'Asia/Tehran',
    )
    referenceTime = fetchedReferenceTime
    // ثبت زمان سیستم (local) در لحظه دریافت؛ ما از moment() بدون تغییر استفاده می‌کنیم (که زمان سیستم را برمی‌گرداند)
    fetchLocalTime = moment()
    console.info(
      `Reference time updated: ${referenceTime.format(
        'YYYY-MM-DD HH:mm:ss Z',
      )} (fetched at local time ${fetchLocalTime.format()})`,
    )
  } catch (error) {
    console.error('Error fetching Iran time from backend:', error)
  }
}

// دریافت اولیه زمان از بک‌اند
updateReferenceTime()
// به‌روزرسانی زمان هر 10 دقیقه (600,000 میلی‌ثانیه)
setInterval(updateReferenceTime, 10 * 60 * 1000)

const PersianDateTime = {
  /**
   * دریافت تاریخ و زمان فعلی ایران
   * @returns {string} تاریخ و ساعت به فرمت استاندارد YYYY-MM-DD HH:mm:ss
   *
   * زمان جاری به صورت زیر محاسبه می‌شود:
   *   currentTime = referenceTime + (now - fetchLocalTime)
   *
   * اگر به هر دلیلی زمان از بک‌اند دریافت نشده باشد، از moment().tz('Asia/Tehran') استفاده می‌شود.
   */
  now: () => {
    if (referenceTime && fetchLocalTime) {
      // محاسبه اختلاف زمانی از لحظه دریافت (بر حسب میلی‌ثانیه)
      const elapsed = moment().diff(fetchLocalTime)
      // محاسبه زمان جاری: زمان دریافتی از بک‌اند + اختلاف زمانی از لحظه دریافت
      const currentTime = moment(referenceTime).add(elapsed, 'milliseconds')
      return currentTime.tz('Asia/Tehran').format('YYYY-MM-DD HH:mm:ss')
    }
    // در صورت عدم وجود مقدار مرجع، از زمان لحظه‌ای با moment استفاده می‌کنیم.
    return moment().tz('Asia/Tehran').format('YYYY-MM-DD HH:mm:ss')
  },

  /**
   * تبدیل یک تاریخ خاص به ساعت ایران
   * @param {string|Date} date - تاریخ ورودی (می‌تواند رشته یا شیء Date باشد)
   * @returns {string} تاریخ و ساعت به فرمت استاندارد YYYY-MM-DD HH:mm:ss
   */
  toPersianTime: date => {
    return moment(date).tz('Asia/Tehran').format('YYYY-MM-DD HH:mm:ss')
  },

  /**
   * تبدیل تاریخ میلادی به تاریخ شمسی
   * @param {string|Date} date - تاریخ ورودی (می‌تواند رشته یا شیء Date باشد)
   * @returns {string} تاریخ شمسی به فرمت استاندارد YYYY-MM-DD HH:mm:ss
   */
  toJalali: date => {
    return moment(date)
      .tz('Asia/Tehran')
      .locale('fa')
      .format('YYYY-MM-DD HH:mm:ss')
  },
}

export default PersianDateTime
