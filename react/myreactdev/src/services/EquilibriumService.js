import axiosInstance from "utils/axiosInstance";

const EquilibriumService = {
  // دریافت موجودی کاربران
  fetchUserBalances: async () => {
    try {
      const response = await axiosInstance.get("/equilibrium/user_balances");
      return response.data;
    } catch (error) {
      console.error("Error fetching user balances:", error);
      throw error.response?.data?.message || "Failed to fetch user balances.";
    }
  },

  // دریافت موجودی شرکت
  fetchCompanyBalances: async () => {
    try {
      const response = await axiosInstance.get("/equilibrium/company_balance");
      return response.data;
    } catch (error) {
      console.error("Error fetching company balances:", error);
      throw (
        error.response?.data?.message || "Failed to fetch company balances."
      );
    }
  },

  // دریافت پیشنهادات لحظه‌ای بر مبنای اختلاف موجودی
  fetchSuggestions: async () => {
    try {
      const response = await axiosInstance.get("/equilibrium/suggestions");
      return response.data;
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      throw error.response?.data?.message || "Failed to fetch suggestions.";
    }
  },

  // ایجاد خودکار پیشنهاد (Auto Create Proposal)
  autoCreateProposals: async () => {
    try {
      const response = await axiosInstance.post(
        "/equilibrium/auto_create_proposals"
      );
      return response.data;
    } catch (error) {
      console.error("Error auto-creating proposals:", error);
      throw error.response?.data?.message || "Failed to auto-create proposals.";
    }
  },

  // تایید پیشنهاد توسط معامله‌گر
  approveProposal: async (proposalId, payload) => {
    try {
      const response = await axiosInstance.put(
        `/equilibrium/proposals/${proposalId}/approve`,
        payload
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "خطا در تایید پیشنهاد");
    }
  },

  // تکمیل پیشنهاد پس از دریافت فیش‌ها
  completeProposal: async (proposalId) => {
    try {
      const response = await axiosInstance.put(
        `/equilibrium/proposals/${proposalId}/complete`
      );
      return response.data;
    } catch (error) {
      console.error("Error completing proposal:", error);
      throw error.response?.data?.message || "Failed to complete proposal.";
    }
  },

  // ثبت تراکنش مرتبط با پیشنهاد تایید شده
  createTransaction: async (data) => {
    try {
      const response = await axiosInstance.post(
        "/equilibrium/transactions",
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error creating transaction:", error);
      throw error.response?.data?.message || "Failed to create transaction.";
    }
  },

  // آپلود فیش تراکنش
  uploadReceipt: async (data) => {
    try {
      const response = await axiosInstance.post("/equilibrium/receipts", data);
      return response.data;
    } catch (error) {
      console.error("Error uploading receipt:", error);
      throw error.response?.data?.message || "Failed to upload receipt.";
    }
  },

  // ثبت اطلاعات طرف مقابل
  createCounterparty: async (data) => {
    try {
      const response = await axiosInstance.post(
        "/equilibrium/counterparties",
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error creating counterparty:", error);
      throw error.response?.data?.message || "Failed to create counterparty.";
    }
  },

  // لیست کردن پیشنهادات
  listProposals: async () => {
    try {
      const response = await axiosInstance.get("/equilibrium/proposals");
      return response.data;
    } catch (error) {
      console.error("Error listing proposals:", error);
      throw error.response?.data?.message || "Failed to list proposals.";
    }
  },

  // لیست کردن تراکنش‌ها
  listTransactions: async () => {
    try {
      const response = await axiosInstance.get("/equilibrium/transactions");
      return response.data;
    } catch (error) {
      console.error("Error listing transactions:", error);
      throw error.response?.data?.message || "Failed to list transactions.";
    }
  },

  // لیست کردن فیش‌های مربوط به یک تراکنش
  listReceipts: async (transactionId) => {
    try {
      if (!transactionId) {
        throw new Error("Transaction ID is required.");
      }
      const response = await axiosInstance.get(
        `/equilibrium/receipts?transaction_id=${transactionId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error listing receipts:", error);
      throw error.response?.data?.message || "Failed to list receipts.";
    }
  },

  // لیست کردن اطلاعات طرف مقابل ثبت شده
  listCounterparties: async () => {
    try {
      const response = await axiosInstance.get("/equilibrium/counterparties");
      return response.data;
    } catch (error) {
      console.error("Error listing counterparties:", error);
      throw error.response?.data?.message || "Failed to list counterparties.";
    }
  },

  // محاسبه و به‌روزرسانی پیشنهادات در صورت تغییر موجودی
  recalculateProposals: async () => {
    try {
      const response = await axiosInstance.post(
        "/equilibrium/recalculate_proposals"
      );
      return response.data;
    } catch (error) {
      console.error("Error recalculating proposals:", error);
      throw error.response?.data?.message || "Failed to recalculate proposals.";
    }
  },

  // ذخیره وضعیت Wizard
  saveWizardState: async (data) => {
    try {
      const response = await axiosInstance.post(
        "/equilibrium/wizard_state",
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error saving wizard state:", error);
      throw error.response?.data?.message || "Failed to save wizard state.";
    }
  },

  // بازیابی وضعیت Wizard برای یک پیشنهاد مشخص
  getWizardState: async (proposalId, traderId) => {
    try {
      const response = await axiosInstance.get(
        `/equilibrium/wizard_state/${proposalId}?TraderID=${traderId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error getting wizard state:", error);
      throw error.response?.data?.message || "Failed to get wizard state.";
    }
  },

  autoRebalance: async () => {
    try {
      const response = await axiosInstance.post("/equilibrium/auto_rebalance");
      return response.data;
    } catch (error) {
      console.error("Error in autoRebalance:", error);
      throw error.response?.data?.message || "Failed to auto rebalance.";
    }
  },
  fetchPartnerBalances: async () => {
    try {
      const response = await axiosInstance.get("/equilibrium/partner_balances");
      return response.data;
    } catch (error) {
      console.error("Error fetching partner balances:", error);
      throw (
        error.response?.data?.message || "Failed to fetch partner balances."
      );
    }
  },
};

export default EquilibriumService;
