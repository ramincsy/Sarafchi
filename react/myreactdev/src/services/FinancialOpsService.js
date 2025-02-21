// services/FinancialOpsService.js
import axiosInstance from "utils/axiosInstance";

const FinancialOpsService = {
  /**
   * لیست یا تاریخچه عملیات مالی (با امکان فیلتر بر اساس userId)
   * GET /financialOps?userId={userId}
   */
  fetchOperations: async (userId) => {
    try {
      let url = "/financialOps";
      if (userId) {
        url += `?userId=${userId}`;
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
   * GET /financialOps/lastStatus/:userId
   */
  fetchLastStatus: async (userId) => {
    try {
      const response = await axiosInstance.get(
        `/financialOps/lastStatus/${userId}`
      );
      // می‌تواند شامل:
      // {
      //   OperationID, Balance, WithdrawableBalance, Debt, Credit, LoanAmount,
      //   Amount, OperationType, LastUpdated,
      //   totalLoanGiven, totalLoanRepaid
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
   * پارامتر operationPayload = {
   *   user_id, operation_type, amount, reason, update_source, updated_by
   * }
   */
  addOperation: async (operationPayload) => {
    try {
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
   * بدنه:
   * {
   *   reverted_by, reason
   * }
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
