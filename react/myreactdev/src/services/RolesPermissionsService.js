import axiosInstance from "../utils/axiosInstance";

const RolesPermissionsService = {
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

  fetchUsers: async () => {
    try {
      const response = await axiosInstance.get(
        "/RolesPermissionsManager/users"
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error.response?.data?.error || "Failed to fetch users.";
    }
  },

  fetchRolesWithPermissions: async () => {
    try {
      const response = await axiosInstance.get(
        "/RolesPermissionsManager/roles/permissions"
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching roles with permissions:", error);
      throw (
        error.response?.data?.error || "Failed to fetch roles with permissions."
      );
    }
  },

  addRole: async (roleName) => {
    try {
      const response = await axiosInstance.post(
        "/RolesPermissionsManager/roles",
        {
          RoleName: roleName,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error adding role:", error);
      throw error.response?.data?.error || "Failed to add role.";
    }
  },

  addPermission: async (permissionName, description) => {
    try {
      const response = await axiosInstance.post(
        "/RolesPermissionsManager/permissions",
        {
          PermissionName: permissionName,
          Description: description,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error adding permission:", error);
      throw error.response?.data?.error || "Failed to add permission.";
    }
  },

  assignPermissionToRole: async (roleId, permissionId) => {
    try {
      const response = await axiosInstance.post(
        `/RolesPermissionsManager/roles/${roleId}/permissions`,
        { PermissionID: permissionId }
      );
      return response.data;
    } catch (error) {
      console.error("Error assigning permission to role:", error);
      throw (
        error.response?.data?.error || "Failed to assign permission to role."
      );
    }
  },

  assignRoleToUser: async (userId, roleId) => {
    try {
      const response = await axiosInstance.post(
        `/RolesPermissionsManager/users/${userId}/roles`,
        { RoleID: roleId }
      );
      return response.data;
    } catch (error) {
      console.error("Error assigning role to user:", error);
      throw error.response?.data?.error || "Failed to assign role to user.";
    }
  },

  removePermissionFromRole: async (roleId, permissionId) => {
    try {
      const response = await axiosInstance.delete(
        `/RolesPermissionsManager/roles/${roleId}/permissions/${permissionId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error removing permission from role:", error);
      throw (
        error.response?.data?.error || "Failed to remove permission from role."
      );
    }
  },

  removeRoleFromUser: async (userId, roleId) => {
    try {
      const response = await axiosInstance.delete(
        `/RolesPermissionsManager/users/${userId}/roles/${roleId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error removing role from user:", error);
      throw error.response?.data?.error || "Failed to remove role from user.";
    }
  },

  deleteRole: async (roleId) => {
    try {
      const response = await axiosInstance.delete(
        `/RolesPermissionsManager/roles/${roleId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting role:", error);
      throw error.response?.data?.error || "Failed to delete role.";
    }
  },

  deletePermission: async (permissionId) => {
    try {
      const response = await axiosInstance.delete(
        `/RolesPermissionsManager/permissions/${permissionId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting permission:", error);
      throw error.response?.data?.error || "Failed to delete permission.";
    }
  },
  assignPermissionToRole: async (roleId, permissionId) => {
    try {
      const response = await axiosInstance.post(
        `/RolesPermissionsManager/roles/${roleId}/permissions`,
        { PermissionID: permissionId }
      );
      return response.data;
    } catch (error) {
      console.error("Error assigning permission to role:", error);
      throw (
        error.response?.data?.error || "Failed to assign permission to role."
      );
    }
  },

  assignRoleToUser: async (userId, roleId) => {
    try {
      const response = await axiosInstance.post(
        `/RolesPermissionsManager/users/${userId}/roles`,
        { RoleID: roleId }
      );
      return response.data;
    } catch (error) {
      console.error("Error assigning role to user:", error);
      throw error.response?.data?.error || "Failed to assign role to user.";
    }
  },

  removePermissionFromRole: async (roleId, permissionId) => {
    try {
      const response = await axiosInstance.delete(
        `/RolesPermissionsManager/roles/${roleId}/permissions/${permissionId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error removing permission from role:", error);
      throw (
        error.response?.data?.error || "Failed to remove permission from role."
      );
    }
  },

  deleteRole: async (roleId) => {
    try {
      const response = await axiosInstance.delete(
        `/RolesPermissionsManager/roles/${roleId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting role:", error);
      throw error.response?.data?.error || "Failed to delete role.";
    }
  },

  deletePermission: async (permissionId) => {
    try {
      const response = await axiosInstance.delete(
        `/RolesPermissionsManager/permissions/${permissionId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting permission:", error);
      throw error.response?.data?.error || "Failed to delete permission.";
    }
  },

  removeRoleFromUser: async (userId, roleId) => {
    try {
      const response = await axiosInstance.delete(
        `/RolesPermissionsManager/users/${userId}/roles/${roleId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error removing role from user:", error);
      throw error.response?.data?.error || "Failed to remove role from user.";
    }
  },

  fetchRolesWithPermissions: async () => {
    try {
      const response = await axiosInstance.get(
        "/RolesPermissionsManager/roles/permissions"
      );
      const rolesData = Array.isArray(response.data) ? response.data : [];
      return rolesData.map((role) => ({
        RoleID: role.RoleID,
        RoleName: role.RoleName,
        Permissions: role.Permissions || [],
      }));
    } catch (error) {
      console.error("Error fetching roles with permissions:", error);
      throw (
        error.response?.data?.error || "Failed to fetch roles with permissions."
      );
    }
  },

  fetchUserRoles: async (userId) => {
    try {
      const response = await axiosInstance.get(
        `/RolesPermissionsManager/users/${userId}/roles`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching roles for user:", error);
      throw error.response?.data?.error || "Failed to fetch user roles.";
    }
  },
};

export default RolesPermissionsService;
