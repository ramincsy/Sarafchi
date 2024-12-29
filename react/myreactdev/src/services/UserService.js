import axiosInstance from "utils/axiosInstance";

const UserService = {
  login: async (email, password) => {
    try {
      const response = await axiosInstance.post(
        "/login",
        { email, password },
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error("Error during login:", error);
      throw error.response?.data?.error || "Failed to login.";
    }
  },

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
      throw error.response?.data?.error || "Failed to create user.";
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
  logout: async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token"); // دریافت توکن از لوکال استوریج
      if (!refreshToken) {
        throw new Error("Refresh token not found");
      }

      const response = await axiosInstance.post("/logout", {
        refresh_token: refreshToken,
      });
      return response.data;
    } catch (error) {
      console.error("Error during logout:", error);
      throw error.response?.data?.error || "Failed to logout.";
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
