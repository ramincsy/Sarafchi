// src/services/TeamBuySellService.js
import axiosInstance from "utils/axiosInstance";

const TeamBuySellService = {
  createTransaction: async (payload) => {
    try {
      const response = await axiosInstance.post(
        "/team-buysell/transactions",
        payload
      );
      return response.data;
    } catch (error) {
      console.error("Error creating transaction:", error);
      throw error.response?.data?.error || "خطا در ایجاد تراکنش.";
    }
  },

  updateTransactionStep: async (
    transactionId,
    step,
    counterpartyUserID = null
  ) => {
    try {
      const response = await axiosInstance.put(
        `/team-buysell/transactions/${transactionId}/step`,
        { step, counterpartyUserID }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating transaction step:", error);
      throw error.response?.data?.error || "خطا در بروزرسانی مرحله تراکنش.";
    }
  },

  uploadReceipt: async (transactionId, receiptFile, receiptType) => {
    try {
      const formData = new FormData();
      formData.append("receiptFile", receiptFile);
      formData.append("receiptType", receiptType);
      const response = await axiosInstance.post(
        `/team-buysell/transactions/${transactionId}/receipts`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return response.data;
    } catch (error) {
      console.error("Error uploading receipt:", error);
      throw error.response?.data?.error || "خطا در آپلود فیش.";
    }
  },

  getAllTransactions: async () => {
    try {
      const response = await axiosInstance.get("/team-buysell/transactions");
      return response.data;
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw error.response?.data?.error || "خطا در دریافت لیست تراکنش‌ها.";
    }
  },

  getTransactionById: async (transactionId) => {
    try {
      const response = await axiosInstance.get(
        `/team-buysell/transactions/${transactionId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching transaction by ID:", error);
      throw error.response?.data?.error || "خطا در دریافت اطلاعات تراکنش.";
    }
  },

  deleteTransaction: async (transactionId) => {
    try {
      const response = await axiosInstance.delete(
        `/team-buysell/transactions/${transactionId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting transaction:", error);
      throw error.response?.data?.error || "خطا در حذف تراکنش.";
    }
  },

  createSuggestion: async (payload) => {
    try {
      const response = await axiosInstance.post(
        "/team-buysell/suggestions",
        payload
      );
      return response.data;
    } catch (error) {
      console.error("Error creating suggestion:", error);
      throw error.response?.data?.error || "خطا در ایجاد پیشنهاد.";
    }
  },

  updateSuggestion: async (suggestionId, payload) => {
    try {
      const response = await axiosInstance.put(
        `/team-buysell/suggestions/${suggestionId}`,
        payload
      );
      return response.data;
    } catch (error) {
      console.error("Error updating suggestion:", error);
      throw error.response?.data?.error || "خطا در بروزرسانی پیشنهاد.";
    }
  },

  getAllSuggestions: async () => {
    try {
      const response = await axiosInstance.get("/team-buysell/suggestions");
      return response.data;
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      throw error.response?.data?.error || "خطا در دریافت پیشنهادات.";
    }
  },

  getSuggestionById: async (suggestionId) => {
    try {
      const response = await axiosInstance.get(
        `/team-buysell/suggestions/${suggestionId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching suggestion by ID:", error);
      throw error.response?.data?.error || "خطا در دریافت اطلاعات پیشنهاد.";
    }
  },

  deleteSuggestion: async (suggestionId) => {
    try {
      const response = await axiosInstance.delete(
        `/team-buysell/suggestions/${suggestionId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting suggestion:", error);
      throw error.response?.data?.error || "خطا در حذف پیشنهاد.";
    }
  },
};

export default TeamBuySellService;
