// src/services/AdminDashboardService.js
import axiosInstance from "../utils/axiosInstance";

const AdminDashboardService = {
  fetchWithdrawals: async () => {
    const response = await axiosInstance.get("/withdrawals");
    return response.data;
  },

  fetchPrice: async () => {
    const response = await axiosInstance.get("/live-price");
    return response.data;
  },

  fetchTransactions: async () => {
    const response = await axiosInstance.get("/transactions");
    return response.data;
  },

  updateWithdrawalStatus: async (id, status) => {
    const response = await axiosInstance.post(`/withdrawals/${id}/status`, {
      Status: status,
    });
    return response.data;
  },

  updateTransactionStatus: async (id, action) => {
    const response = await axiosInstance.post(`/transactions/${action}/${id}`);
    return response.data;
  },
};

export default AdminDashboardService;
