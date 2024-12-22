import axiosInstance from "../utils/axiosInstance";

const ExchangePricesService = {
  fetchExchangePrices: async () => {
    try {
      const response = await axiosInstance.get("/exchange-prices");
      return response.data;
    } catch (error) {
      console.error("Error fetching exchange prices:", error);
      throw error.response?.data?.error || "Failed to fetch exchange prices.";
    }
  },
};

export default ExchangePricesService;
