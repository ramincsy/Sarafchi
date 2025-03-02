// services/FinancialOpsService.js
import axiosInstance from "utils/axiosInstance";

const FinancialOpsService = {
  /**
   * لیست یا تاریخچه عملیات مالی (با امکان فیلتر بر اساس userId و currency)
   * GET /financialOps?userId={userId}&currency={currencyType}
   * - userId: عدد شناسه کاربر (مثلاً 4096)
   * - currency: اختیاری (مثلاً 'IRR', 'USDT', ...)
   */
  fetchOperations: async (userId, currency) => {
    try {
      let url = "/financialOps";
      const params = [];

      if (userId) {
        params.push(`userId=${userId}`);
      }
      if (currency) {
        params.push(`currency=${currency}`);
      }

      if (params.length > 0) {
        url += "?" + params.join("&");
      }

      const response = await axiosInstance.get(url);
      return response.data; // آرایه‌ای از رکوردهای عملیات
    } catch (error) {
      console.error("Error fetching financial operations:", error);
      throw (
        error.response?.data?.error || "Failed to fetch financial operations."
      );
    }
  },

  /**
   * آخرین وضعیت مالی کاربر به‌همراه totalLoanGiven و totalLoanRepaid
   * GET /financialOps/lastStatus/:userId?currency=...
   * - userId: شناسه کاربر
   * - currency: اختیاری (نام ارز)
   */
  fetchLastStatus: async (userId, currency) => {
    try {
      let url = `/financialOps/lastStatus/${userId}`;
      if (currency) {
        url += `?currency=${currency}`;
      }

      const response = await axiosInstance.get(url);
      // پاسخ می‌تواند شامل:
      // {
      //   OperationID, CurrencyType, Balance, WithdrawableBalance,
      //   Debt, Credit, LoanAmount, Amount, OperationType,
      //   totalLoanGiven, totalLoanRepaid,
      //   ...
      // }
      return response.data;
    } catch (error) {
      console.error("Error fetching last status:", error);
      throw error.response?.data?.error || "No last status found.";
    }
  },

  /**
   * ایجاد/افزودن عملیات مالی جدید (Charge, Withdraw, Loan, LoanRepayment, ...)
   * POST /financialOps
   * بدنهٔ درخواست (operationPayload) = {
   *   user_id,          // number
   *   currency_type,    // string (مثلاً 'IRR', 'USDT')
   *   operation_type,   // string (Charge, Withdraw, ...)
   *   amount,           // number
   *   reason,           // string
   *   update_source,    // string
   *   updated_by        // number
   * }
   */
  addOperation: async (operationPayload) => {
    try {
      // در صورت نبود currency_type، می‌توانید در همین جا مقدار پیش‌فرض بگذارید
      if (!operationPayload.currency_type) {
        operationPayload.currency_type = "IRR";
      }

      const response = await axiosInstance.post(
        "/financialOps",
        operationPayload
      );
      return response.data;
    } catch (error) {
      console.error("Error adding financial operation:", error);
      throw error.response?.data?.error || "Failed to add financial operation.";
    }
  },

  /**
   * بازگردانی (Revert) یک عملیات
   * POST /financialOps/revert/:operationId
   * بدنه: { reverted_by, reason }
   */
  revertOperation: async (operationId, revertPayload) => {
    try {
      const response = await axiosInstance.post(
        `/financialOps/revert/${operationId}`,
        revertPayload
      );
      return response.data;
    } catch (error) {
      console.error("Error reverting financial operation:", error);
      throw (
        error.response?.data?.error || "Failed to revert financial operation."
      );
    }
  },

  /**
   * پاک کردن همهٔ رکوردهای جدول UserFinancialOperations
   * DELETE /financialOps/clear
   */
  clearAllOperations: async () => {
    try {
      const response = await axiosInstance.delete("/financialOps/clear");
      return response.data; // {"message": "..."}
    } catch (error) {
      console.error("Error clearing all financial operations:", error);
      throw error.response?.data?.error || "Failed to clear operations.";
    }
  },
};

export default FinancialOpsService;
