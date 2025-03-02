import axiosInstance from "utils/axiosInstance";

const BalancesService = {
  fetchBalances: async (user_id) => {
    try {
      if (!user_id) {
        throw new Error("User ID is required.");
      }
      const response = await axiosInstance.get(`/balances/${user_id}`);

      return response.data;
    } catch (error) {
      console.error("Error fetching balances:", error);
      throw error.response?.data?.message || "Failed to fetch balances.";
    }
  },
};

export default BalancesService;
