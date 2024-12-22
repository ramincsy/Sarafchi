import axiosInstance from "../utils/axiosInstance";

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
