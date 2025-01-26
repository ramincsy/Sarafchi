// src/services/WithdrawalsUSDTService.js
import axiosInstance from "utils/axiosInstance";

const WithdrawalsUSDTService = {
  /**
   * دریافت تمام برداشت‌های USDT
   * @returns {Promise<Object>} - اطلاعات تمام برداشت‌ها
   */
  fetchAllWithdrawals: async () => {
    try {
      const response = await axiosInstance.get(`/withdrawals_usdt/all`);
      console.log("Fetched all withdrawals:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching all withdrawals:", error);
      throw error;
    }
  },

  /**
   * دریافت برداشت‌های یک کاربر خاص
   * @param {number} userId - شناسه کاربر
   * @returns {Promise<Object>} - اطلاعات برداشت‌های کاربر
   */
  fetchWithdrawalsByUser: async (userId) => {
    try {
      const response = await axiosInstance.get(
        `/withdrawals_usdt/user/${userId}`
      );
      console.log(`Fetched withdrawals for user ${userId}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching withdrawals for user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * ثبت درخواست برداشت USDT
   * @param {Object} withdrawalData - اطلاعات برداشت شامل مقدار و آدرس مقصد
   * @returns {Promise<Object>} - نتیجه درخواست
   */
  createWithdrawal: async (withdrawalData) => {
    try {
      const response = await axiosInstance.post(
        `/withdrawals_usdt`,
        withdrawalData
      );
      console.log("Created withdrawal:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error creating USDT withdrawal:", error);
      throw error;
    }
  },

  /**
   * تایید تراکنش برداشت USDT
   * @param {Object} approvalData - اطلاعات تایید شامل WithdrawalID، StatusChangedBy، و TransactionTxID
   * @returns {Promise<Object>} - نتیجه تایید
   */
  approveWithdrawal: async (approvalData) => {
    try {
      const response = await axiosInstance.post(
        `/withdrawals_usdt/approve`,
        approvalData
      );
      console.log("Approved withdrawal:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error approving withdrawal:", error);
      throw error;
    }
  },

  /**
   * لغو تراکنش برداشت USDT
   * @param {Object} rejectionData - اطلاعات لغو شامل WithdrawalID و StatusChangedBy
   * @returns {Promise<Object>} - نتیجه لغو
   */
  rejectWithdrawal: async (rejectionData) => {
    try {
      const response = await axiosInstance.post(
        `/withdrawals_usdt/reject`,
        rejectionData
      );
      console.log("Rejected withdrawal:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error rejecting withdrawal:", error);
      throw error;
    }
  },
};

export default WithdrawalsUSDTService;
