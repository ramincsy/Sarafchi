// services/EqualityDataService.js
import axiosInstance from "utils/axiosInstance";

const EqualityDataService = {
  fetchEqualityData: async () => {
    const response = await axiosInstance.get("/equality-data");
    // یا هر آدرس که در بک‌اند ثبت کرده‌اید (مثلاً /api/equality-data)
    return response.data;
  },
};

export default EqualityDataService;
