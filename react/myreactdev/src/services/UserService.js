import axiosInstance from "utils/axiosInstance";

const UserService = {
  fetchUsers: async () => {
    try {
      const response = await axiosInstance.get("/listusers"); // مسیر صحیح
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error.response?.data?.error || "Failed to fetch users.";
    }
  },

  createUser: async (userPayload) => {
    try {
      const response = await axiosInstance.post("/useradd", userPayload); // مسیر صحیح
      return response.data;
    } catch (error) {
      console.error("Error creating user:", error);

      // بررسی وجود پاسخ از سرور و مدیریت خطا
      if (error.response && error.response.data) {
        const serverError =
          error.response.data.error || "خطای ناشناخته از سمت سرور";
        throw new Error(serverError);
      } else {
        // مدیریت خطای اتصال یا مشکلات غیر از سرور
        throw new Error("خطا در اتصال به سرور. لطفاً دوباره تلاش کنید.");
      }
    }
  },

  updateUser: async (id, userPayload) => {
    try {
      const response = await axiosInstance.put(
        `/userupdate/${id}`, // مسیر صحیح
        userPayload
      );
      return response.data;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error.response?.data?.error || "Failed to update user.";
    }
  },

  getUserDetails: async (userId) => {
    try {
      const response = await axiosInstance.get(`/userdetails/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching user details:", error);
      throw error.response?.data?.error || "Failed to fetch user details.";
    }
  },

  deleteUser: async (id) => {
    try {
      const response = await axiosInstance.delete(`/userdelete/${id}`); // مسیر صحیح
      return response.data;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error.response?.data?.error || "Failed to delete user.";
    }
  },
};

export default UserService;
