import axiosInstance from "../utils/axiosInstance";

const PriceService = {
  fetchPrice: async () => {
    const response = await axiosInstance.get("/live-price");
    return response.data;
  },
};

export default PriceService;
