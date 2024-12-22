import axiosInstance from "../utils/axiosInstance";

const JibitService = {
  cardToIban: async (cardNumber, userId) => {
    try {
      const response = await axiosInstance.get("/jibit/card-to-iban", {
        params: { card_number: cardNumber, user_id: userId },
      });
      return response.data;
    } catch (error) {
      console.error("Error in Card to IBAN:", error.response || error);
      throw (
        error.response?.data?.error || "Failed to fetch Card to IBAN inquiry."
      );
    }
  },

  ibanInquiry: async (iban, userId) => {
    try {
      const response = await axiosInstance.get("/jibit/iban-inquiry", {
        params: { iban, user_id: userId },
      });
      return response.data;
    } catch (error) {
      console.error("Error in IBAN Inquiry:", error);
      throw error.response?.data?.error || "An unexpected error occurred.";
    }
  },
};

export default JibitService;
