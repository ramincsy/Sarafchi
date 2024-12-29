import axiosInstance from "utils/axiosInstance";

const PagesService = {
  fetchPages: async () => {
    try {
      const response = await axiosInstance.get("/pages");
      return response.data;
    } catch (error) {
      console.error("Error fetching pages:", error);
      throw error.response?.data?.error || "Failed to fetch pages.";
    }
  },

  fetchRoles: async () => {
    try {
      const response = await axiosInstance.get(
        "/RolesPermissionsManager/roles"
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching roles:", error);
      throw error.response?.data?.error || "Failed to fetch roles.";
    }
  },

  fetchPermissions: async () => {
    try {
      const response = await axiosInstance.get(
        "/RolesPermissionsManager/permissions"
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching permissions:", error);
      throw error.response?.data?.error || "Failed to fetch permissions.";
    }
  },

  addPage: async (pageData) => {
    try {
      const response = await axiosInstance.post("/pages", pageData);
      return response.data;
    } catch (error) {
      console.error("Error adding page:", error);
      throw error.response?.data?.error || "Failed to add page.";
    }
  },

  editPage: async (pageId, pageData) => {
    try {
      const response = await axiosInstance.put(`/pages/${pageId}`, pageData);
      return response.data;
    } catch (error) {
      console.error("Error editing page:", error);
      throw error.response?.data?.error || "Failed to edit page.";
    }
  },

  deletePage: async (pageId) => {
    try {
      const response = await axiosInstance.delete(`/pages/${pageId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting page:", error);
      throw error.response?.data?.error || "Failed to delete page.";
    }
  },

  assignRoleToPage: async (pageId, roleId) => {
    try {
      const response = await axiosInstance.post(`/pages/${pageId}/roles`, {
        RoleID: roleId,
      });
      return response.data;
    } catch (error) {
      console.error("Error assigning role to page:", error);
      throw error.response?.data?.error || "Failed to assign role to page.";
    }
  },

  assignPermissionToPage: async (pageId, permissionId) => {
    try {
      const response = await axiosInstance.post(
        `/pages/${pageId}/permissions`,
        {
          PermissionID: permissionId,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error assigning permission to page:", error);
      throw (
        error.response?.data?.error || "Failed to assign permission to page."
      );
    }
  },
};

export default PagesService;
