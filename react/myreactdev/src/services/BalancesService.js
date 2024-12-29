import axiosInstance from "utils/axiosInstance";

const BalancesService = {
  fetchBalances: async (user_id) => {
    try {
      const response = await axiosInstance.get(`/balances/${user_id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching balances:", error);
      throw error;
    }
  },
};

export default BalancesService;
