// src/services/TransactionService.js
import axiosInstance from "../utils/axiosInstance";

const TransactionService = {
  fetchPrice: async (currency) => {
    try {
      const response = await axiosInstance.get(`/live-price`, {
        params: { currency },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching price:", error);
      throw error;
    }
  },
  fetchTransactions: async () => {
    try {
      const response = await axiosInstance.get(`/transactions`);
      return response.data;
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    }
  },
  updateTransactionStatus: async (id, action) => {
    const response = await axiosInstance.post(`/transactions/${action}/${id}`);
    return response.data;
  },
  createTransaction: async (transactionData) => {
    try {
      const response = await axiosInstance.post(
        `/transactions`,
        transactionData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating transaction:", error);
      throw error;
    }
  },
};

export default TransactionService;
