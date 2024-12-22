import React, { useState, useEffect, useCallback } from "react";

import "./RolesPermissionsManager.css";
import RolesPermissionsService from "../services/RolesPermissionsService";
const RolesPermissionsManager = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [newPermission, setNewPermission] = useState("");
  const [rolePermissions, setRolePermissions] = useState({});
  const [userRoles, setUserRoles] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState({});

  const fetchUsers = useCallback(async () => {
    try {
      const data = await RolesPermissionsService.fetchUsers();
      setUsers(data);
    } catch (err) {
      setError("خطا در دریافت کاربران.");
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    try {
      const data = await RolesPermissionsService.fetchRoles();
      setRoles(data);
    } catch (err) {
      setError("خطا در دریافت نقش‌ها.");
    }
  }, []);

  const fetchRolesWithPermissions = useCallback(async () => {
    try {
      setLoading(true);
      const rolesData =
        await RolesPermissionsService.fetchRolesWithPermissions();

      // پردازش داده‌ها
      const formattedRolePermissions = rolesData.reduce((acc, role) => {
        acc[role.RoleID] = role.Permissions;
        return acc;
      }, {});

      setRolePermissions(formattedRolePermissions);
      setRoles(
        rolesData.map((role) => ({
          RoleID: role.RoleID,
          RoleName: role.RoleName,
        }))
      );
    } catch (err) {
      setError(`خطا در دریافت نقش‌ها و مجوزها: ${err}`);
      console.error("Error fetching roles with permissions:", err);
    } finally {
      setLoading(false);
    }
  }, []); // وابستگی به متغیرها حذف شد

  const fetchPermissions = useCallback(async () => {
    try {
      const data = await RolesPermissionsService.fetchPermissions();
      setPermissions(data);
    } catch (err) {
      setError("خطا در دریافت مجوزها.");
    }
  }, []);
  useEffect(() => {
    fetchRolesWithPermissions();
    fetchUsers();
    fetchRoles();
    fetchPermissions();
  }, []); // وابستگی‌ها حذف شدند

  const fetchUserRoles = async (userId) => {
    try {
      setLoading(true);
      const roles = await RolesPermissionsService.fetchUserRoles(userId);
      setUserRoles((prev) => ({ ...prev, [userId]: roles }));
    } catch (err) {
      setError(`خطا در دریافت نقش‌های کاربر ${userId}: ${err}`);
      console.error("Error fetching roles for user:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRole = async () => {
    if (!newRole) {
      setError("نام نقش نمی‌تواند خالی باشد.");
      return;
    }
    try {
      await RolesPermissionsService.addRole(newRole);
      setNewRole("");
      fetchRoles();
    } catch (err) {
      setError("خطا در افزودن نقش.");
    }
  };

  const handleAddPermission = async () => {
    if (!newPermission) {
      setError("نام مجوز نمی‌تواند خالی باشد.");
      return;
    }
    try {
      await RolesPermissionsService.addPermission(
        newPermission,
        "توضیحات دلخواه"
      );
      setNewPermission("");
      fetchPermissions();
    } catch (err) {
      setError("خطا در افزودن مجوز.");
    }
  };

  const handleAssignPermissionToRole = async (roleId, permissionId) => {
    console.log("Selected Role ID:", roleId);
    console.log("Selected Permission ID:", permissionId);

    if (!roleId || !permissionId) {
      setError("لطفاً یک نقش و یک مجوز انتخاب کنید.");
      return;
    }

    try {
      await RolesPermissionsService.assignPermissionToRole(
        roleId,
        permissionId
      );
      alert("مجوز با موفقیت به نقش تخصیص داده شد.");
    } catch (err) {
      console.error("Error assigning permission to role:", err);
      setError(
        `خطا در تخصیص مجوز: ${err.response?.data?.error || err.message}`
      );
    }
  };

  const handleAssignRoleToUser = async () => {
    if (!selectedUser || !selectedRole) {
      setError("لطفاً یک کاربر و یک نقش انتخاب کنید.");
      return;
    }

    try {
      await RolesPermissionsService.assignRoleToUser(
        selectedUser,
        selectedRole
      );
      alert("نقش با موفقیت به کاربر تخصیص داده شد.");
      fetchUserRoles(selectedUser); // به‌روزرسانی لیست نقش‌های کاربر
      setSelectedRole(""); // پاک کردن نقش انتخاب‌شده
    } catch (err) {
      setError(
        `خطا در تخصیص نقش به کاربر: ${err.response?.data?.error || err.message}`
      );
      console.error("Error assigning role to user:", err);
    }
  };

  const handleRemovePermissionFromRole = async (roleId, permissionId) => {
    try {
      await RolesPermissionsService.removePermissionFromRole(
        roleId,
        permissionId
      );
      alert("مجوز با موفقیت از نقش حذف شد.");
      fetchRoles(); // به‌روزرسانی لیست نقش‌ها و مجوزها
    } catch (err) {
      setError(
        `خطا در حذف مجوز از نقش: ${err.response?.data?.error || err.message}`
      );
      console.error(err);
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (!window.confirm("آیا از حذف این نقش اطمینان دارید؟")) return;

    try {
      await RolesPermissionsService.deleteRole(roleId);
      alert("نقش با موفقیت حذف شد.");
      fetchRoles(); // به‌روزرسانی لیست نقش‌ها
    } catch (err) {
      setError(`خطا در حذف نقش: ${err.response?.data?.error || err.message}`);
      console.error(err);
    }
  };

  const handleDeletePermission = async (permissionId) => {
    if (!window.confirm("آیا از حذف این مجوز اطمینان دارید؟")) return;

    try {
      await RolesPermissionsService.deletePermission(permissionId);
      alert("مجوز با موفقیت حذف شد.");
      fetchPermissions(); // به‌روزرسانی لیست مجوزها
    } catch (err) {
      setError(`خطا در حذف مجوز: ${err.response?.data?.error || err.message}`);
      console.error(err);
    }
  };

  const handleRemoveRoleFromUser = async (userId, roleId) => {
    if (!window.confirm("آیا از حذف این نقش اطمینان دارید؟")) return;

    try {
      await RolesPermissionsService.removeRoleFromUser(userId, roleId);
      alert("نقش با موفقیت حذف شد.");
      fetchUserRoles(userId); // به‌روزرسانی لیست نقش‌های کاربر
    } catch (err) {
      setError(
        `خطا در حذف نقش از کاربر: ${err.response?.data?.error || err.message}`
      );
      console.error(err);
    }
  };

  return (
    <div className="roles-permissions-manager">
      <h1>مدیریت نقش‌ها و مجوزها</h1>
      {error && <p className="error">{error}</p>}
      {loading && <div className="loading">در حال بارگذاری...</div>}

      {/* Add Roles Section */}
      <div className="section">
        <h2>مدیریت نقش‌ها</h2>
        <div className="input-group">
          <input
            type="text"
            placeholder="نام نقش جدید"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
          />
          <button onClick={handleAddRole}>افزودن نقش</button>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>شناسه نقش</th>
                <th>نام نقش</th>
                <th>مجوزهای تخصیص‌داده‌شده</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => {
                const selectedPermissionForRole =
                  selectedPermissions[role.RoleID] !== undefined
                    ? selectedPermissions[role.RoleID]
                    : "";

                return (
                  <tr key={role.RoleID}>
                    <td>{role.RoleID}</td>
                    <td>{role.RoleName}</td>
                    <td>
                      {rolePermissions[role.RoleID]?.length > 0 ? (
                        rolePermissions[role.RoleID].map((permission) => (
                          <span key={permission.PermissionID} className="tag">
                            {permission.PermissionName}
                          </span>
                        ))
                      ) : (
                        <span className="no-permissions">
                          مجوزی تخصیص داده نشده
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="action-group">
                        <select
                          onChange={(e) =>
                            setSelectedPermissions((prev) => ({
                              ...prev,
                              [role.RoleID]: e.target.value,
                            }))
                          }
                          value={selectedPermissionForRole}
                        >
                          <option value="">انتخاب مجوز</option>
                          {permissions.map((permission) => (
                            <option
                              key={permission.PermissionID}
                              value={permission.PermissionID}
                            >
                              {permission.PermissionName}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => {
                            if (selectedPermissionForRole) {
                              handleAssignPermissionToRole(
                                role.RoleID,
                                parseInt(selectedPermissionForRole, 10)
                              );
                            } else {
                              alert("لطفاً یک مجوز انتخاب کنید.");
                            }
                          }}
                        >
                          افزودن مجوز
                        </button>
                        <button
                          onClick={() => {
                            const permissionId = parseInt(
                              selectedPermissionForRole,
                              10
                            );
                            if (!isNaN(permissionId)) {
                              handleAssignPermissionToRole(
                                role.RoleID,
                                permissionId
                              );
                            } else {
                              alert("لطفاً یک مجوز انتخاب کنید.");
                            }
                          }}
                          className="remove-button"
                        >
                          حذف مجوز
                        </button>
                        <button
                          onClick={() => handleDeleteRole(role.RoleID)}
                          className="delete-role-button"
                        >
                          حذف نقش
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Permissions Section */}
      <div className="section">
        <h2>مدیریت مجوزها</h2>
        <div className="input-group">
          <input
            type="text"
            placeholder="نام مجوز جدید"
            value={newPermission}
            onChange={(e) => setNewPermission(e.target.value)}
          />
          <button onClick={handleAddPermission}>افزودن مجوز</button>
        </div>
        <ul className="permissions-list">
          {permissions.map((permission) => (
            <li key={permission.PermissionID} className="permission-item">
              <span>{permission.PermissionName}</span>
              <button
                onClick={() => handleDeletePermission(permission.PermissionID)}
                className="delete-permission-button"
              >
                حذف
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* User Table Section */}
      <div className="section">
        <h2>مدیریت کاربران</h2>
        <table className="table">
          <thead>
            <tr>
              <th>شناسه</th>
              <th>نام</th>
              <th>نقش‌ها</th>
              <th>مجوزها</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.UserID}>
                <td>{user.UserID || "بدون شناسه"}</td>
                <td>{`${user.FirstName || "نام"} ${
                  user.LastName || "نام خانوادگی"
                }`}</td>
                <td>
                  {user.Roles && user.Roles.length > 0 ? (
                    user.Roles.map((role) => (
                      <div
                        className="role-item"
                        style={{
                          display: "flex",
                          gap: "10px",
                          alignItems: "center",
                        }}
                        key={role.RoleID}
                      >
                        <span className="badge">{role.RoleName}</span>
                        <button
                          className="btn-danger"
                          onClick={() =>
                            handleRemoveRoleFromUser(user.UserID, role.RoleID)
                          }
                        >
                          حذف
                        </button>
                      </div>
                    ))
                  ) : (
                    <span className="no-roles">نقشی تخصیص داده نشده</span>
                  )}
                </td>
                <td>
                  {user.Permissions && user.Permissions.length > 0 ? (
                    user.Permissions.map((permission) => (
                      <span className="badge" key={permission.PermissionID}>
                        {permission.PermissionName}
                      </span>
                    ))
                  ) : (
                    <span className="no-permissions">
                      مجوزی تخصیص داده نشده
                    </span>
                  )}
                </td>
                <td>
                  <button
                    className="btn-primary"
                    onClick={() => {
                      setSelectedUser(user.UserID);
                      setSelectedRole(""); // اطمینان از پاک شدن نقش قبلی
                    }}
                  >
                    انتخاب
                  </button>
                  {selectedUser === user.UserID && (
                    <div className="assign-role">
                      <select
                        onChange={(e) => setSelectedRole(e.target.value)}
                        value={selectedRole || ""}
                      >
                        <option value="" disabled>
                          انتخاب نقش
                        </option>
                        {roles.map((role) => (
                          <option key={role.RoleID} value={role.RoleID}>
                            {role.RoleName}
                          </option>
                        ))}
                      </select>
                      <button
                        className="btn-success"
                        onClick={handleAssignRoleToUser}
                      >
                        تخصیص نقش
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Role Permissions Section */}
      <div className="section">
        <h2>مجوزهای نقش</h2>
        <table className="table">
          <thead>
            <tr>
              <th>شناسه نقش</th>
              <th>نام نقش</th>
              <th>مجوزها</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role.RoleID}>
                <td>{role.RoleID}</td>
                <td>{role.RoleName}</td>
                <td>
                  {rolePermissions[role.RoleID]?.length > 0 ? (
                    rolePermissions[role.RoleID].map((permission) => (
                      <span
                        key={permission.PermissionID}
                        style={{
                          display: "inline-block",
                          padding: "5px 10px",
                          margin: "2px",
                          backgroundColor: "#e9ecef",
                          borderRadius: "4px",
                        }}
                      >
                        {permission.PermissionName}
                      </span>
                    ))
                  ) : (
                    <span>مجوزی تخصیص داده نشده</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Assign Role to User */}
    </div>
  );
};

export default RolesPermissionsManager;
