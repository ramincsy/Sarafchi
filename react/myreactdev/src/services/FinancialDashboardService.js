import axiosInstance from "utils/axiosInstance";

const FinancialDashboardService = {
  /**
   * دریافت اطلاعات کلی موجودی کاربران و کیف پول صرافی
   * @returns {Promise<Object>} - داده‌های مربوط به موجودی کاربران و کیف پول صرافی
   */
  fetchOverview: async () => {
    try {
      const response = await axiosInstance.get("/financial-dashboard/overview");
      return response.data;
    } catch (error) {
      console.error("Error fetching financial dashboard overview:", error);
      throw error;
    }
  },

  /**
   * دریافت لاگ تغییرات موجودی
   * @param {number} page - شماره صفحه (پیش‌فرض: 1)
   * @param {number} perPage - تعداد آیتم‌ها در هر صفحه (پیش‌فرض: 100)
   * @returns {Promise<Array>} - لیست لاگ‌های تغییرات موجودی
   */
  fetchBalanceLogs: async (page = 1, perPage = 100) => {
    try {
      const response = await axiosInstance.get("/financial-dashboard/logs", {
        params: { page, per_page: perPage },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching balance logs:", error);
      throw error;
    }
  },

  /**
   * دریافت تراکنش‌های اخیر
   * @param {number} page - شماره صفحه (پیش‌فرض: 1)
   * @param {number} perPage - تعداد آیتم‌ها در هر صفحه (پیش‌فرض: 100)
   * @returns {Promise<Array>} - لیست تراکنش‌های اخیر
   */
  fetchTransactions: async (page = 1, perPage = 100) => {
    try {
      const response = await axiosInstance.get(
        "/financial-dashboard/transactions",
        {
          params: { page, per_page: perPage },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    }
  },

  /**
   * مانیتورینگ موجودی کاربران و کیف پول صرافی
   * @returns {Promise<Object>} - داده‌های مربوط به مانیتورینگ موجودی
   */
  fetchBalanceMonitor: async () => {
    try {
      const response = await axiosInstance.get(
        "/financial-dashboard/balance-monitor"
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching balance monitor data:", error);
      throw error;
    }
  },
};

export default FinancialDashboardService;
