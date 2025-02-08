import moment from 'moment-timezone'

const PersianDateTime = {
  /**
   * دریافت تاریخ و زمان فعلی ایران
   * @returns {string} تاریخ و ساعت به فرمت استاندارد YYYY-MM-DD HH:mm:ss
   */
  now: () => {
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
   * @returns {string} تاریخ شمسی به فرمت YYYY-MM-DD HH:mm:ss
   */
  toJalali: date => {
    return moment(date)
      .tz('Asia/Tehran')
      .locale('fa')
      .format('YYYY-MM-DD HH:mm:ss')
  },
}

export default PersianDateTime
