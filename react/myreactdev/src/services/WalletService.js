import axiosInstance from "utils/axiosInstance";

const WalletService = {
  // دریافت آدرس کیف پول TRX از سرور
  getTRXWalletAddress: async () => {
    try {
      const response = await axiosInstance.get("/get-trx-wallet"); // مسیر endpoint مربوط به دریافت آدرس کیف پول
      return response.data.walletAddress; // بازگرداندن آدرس کیف پول
    } catch (error) {
      console.error("Error fetching TRX wallet address:", error);
      throw (
        error.response?.data?.error || "Failed to fetch TRX wallet address."
      );
    }
  },
};

export default WalletService;
