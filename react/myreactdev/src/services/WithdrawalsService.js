// src/services/WithdrawalsService.js
import axiosInstance from "../utils/axiosInstance";

const WithdrawalsService = {
  createWithdrawal: async (payload) => {
    try {
      const response = await axiosInstance.post("/withdrawals", payload);
      return response.data;
    } catch (error) {
      console.error("Error creating withdrawal:", error);
      throw error.response?.data || "Failed to create withdrawal.";
    }
  },
  updateWithdrawalStatus: async (id, status) => {
    const response = await axiosInstance.post(`/withdrawals/${id}/status`, {
      Status: status,
    });
    return response.data;
  },

  fetchWithdrawals: async () => {
    try {
      const response = await axiosInstance.get("/withdrawals");
      return response.data;
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
      throw error.response?.data || "Failed to fetch withdrawals.";
    }
  },
};

export default WithdrawalsService;
