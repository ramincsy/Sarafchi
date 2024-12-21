import React, { useState, useEffect } from "react";
import axios from "axios";
import "./PageManager.css";

const PageManager = () => {
  const [pages, setPages] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [newPage, setNewPage] = useState({ PageName: "", PageURL: "" });
  const [selectedPage, setSelectedPage] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedPermission, setSelectedPermission] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPages();
    fetchRoles();
    fetchPermissions();
  }, []);

  const axiosInstance = axios.create({
    baseURL: "http://127.0.0.1:5000/api/pages", // مسیر پایه مستقیم به `/api/pages` تنظیم شده است
    headers: {
      "Content-Type": "application/json",
    },
  });

  const fetchPages = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/pages");
      setPages(response.data);
    } catch (err) {
      setError("خطا در دریافت صفحات.");
      console.error(err);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/RolesPermissionsManager/roles"
      );
      setRoles(response.data);
    } catch (err) {
      setError("خطا در دریافت نقش‌ها.");
      console.error(err);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/RolesPermissionsManager/permissions"
      );
      setPermissions(response.data);
    } catch (err) {
      setError("خطا در دریافت مجوزها.");
      console.error(err);
    }
  };

  const handleAddPage = async () => {
    if (!newPage.PageName || !newPage.PageURL) {
      setError("نام و URL صفحه نمی‌تواند خالی باشد.");
      return;
    }
    try {
      console.log("Posting to baseURL:", axiosInstance.defaults.baseURL);
      console.log("Payload:", newPage);

      const response = await axiosInstance.post("", newPage); // مسیر نباید `/pages` اضافی داشته باشد
      console.log("Response:", response.data);

      setNewPage({ PageName: "", PageURL: "" });
      fetchPages();
    } catch (err) {
      setError(err.response?.data?.error || "خطا در افزودن صفحه.");
      console.error("Error adding page:", err.response?.data || err);
    }
  };

  const handleEditPage = async (pageId) => {
    if (!selectedPage.PageName || !selectedPage.PageURL) {
      setError("نام و URL صفحه نمی‌تواند خالی باشد.");
      return;
    }
    try {
      await axiosInstance.put(`/${pageId}`, selectedPage); // مسیر شامل فقط ID صفحه
      setSelectedPage(null);
      fetchPages();
    } catch (err) {
      setError("خطا در ویرایش صفحه.");
      console.error(err);
    }
  };

  const handleDeletePage = async (pageId) => {
    if (!window.confirm("آیا از حذف این صفحه اطمینان دارید؟")) return;
    try {
      await axiosInstance.delete(`/${pageId}`); // مسیر شامل فقط ID صفحه
      fetchPages();
    } catch (err) {
      setError("خطا در حذف صفحه.");
      console.error(err);
    }
  };

  const handleAssignRoleToPage = async (pageId) => {
    try {
      const response = await axiosInstance.post(`/${pageId}/roles`, {
        RoleID: selectedRole,
      });
      console.log("Role assigned successfully:", response.data);
      fetchPages();
    } catch (err) {
      setError("خطا در تخصیص نقش به صفحه.");
      console.error("Error assigning role:", err.response?.data || err);
    }
  };

  const handleAssignPermissionToPage = async (pageId) => {
    try {
      const response = await axiosInstance.post(`/${pageId}/permissions`, {
        PermissionID: selectedPermission,
      });
      console.log("Permission assigned successfully:", response.data);
      fetchPages();
    } catch (err) {
      setError("خطا در تخصیص مجوز به صفحه.");
      console.error("Error assigning permission:", err.response?.data || err);
    }
  };

  return (
    <div className="page-manager">
      <h1>مدیریت صفحات</h1>
      {error && <p className="error">{error}</p>}
      <div className="add-page">
        <input
          type="text"
          placeholder="نام صفحه"
          value={newPage.PageName}
          onChange={(e) => setNewPage({ ...newPage, PageName: e.target.value })}
        />
        <input
          type="text"
          placeholder="URL صفحه"
          value={newPage.PageURL}
          onChange={(e) => setNewPage({ ...newPage, PageURL: e.target.value })}
        />
        <button onClick={handleAddPage}>افزودن صفحه</button>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>شناسه</th>
            <th>نام صفحه</th>
            <th>URL صفحه</th>
            <th>نقش‌ها</th>
            <th>مجوزها</th>
            <th>عملیات</th>
          </tr>
        </thead>
        <tbody>
          {pages.map((page) => (
            <tr key={page.PageID}>
              <td>{page.PageID}</td>
              <td>
                {selectedPage?.PageID === page.PageID ? (
                  <input
                    type="text"
                    value={selectedPage.PageName}
                    onChange={(e) =>
                      setSelectedPage({
                        ...selectedPage,
                        PageName: e.target.value,
                      })
                    }
                  />
                ) : (
                  page.PageName
                )}
              </td>
              <td>
                {selectedPage?.PageID === page.PageID ? (
                  <input
                    type="text"
                    value={selectedPage.PageURL}
                    onChange={(e) =>
                      setSelectedPage({
                        ...selectedPage,
                        PageURL: e.target.value,
                      })
                    }
                  />
                ) : (
                  page.PageURL
                )}
              </td>
              <td>{page.Roles || "نقشی تخصیص داده نشده"}</td>
              <td>{page.Permissions || "مجوزی تخصیص داده نشده"}</td>
              <td>
                {selectedPage?.PageID === page.PageID ? (
                  <>
                    <button onClick={() => handleEditPage(page.PageID)}>
                      ذخیره
                    </button>
                    <button onClick={() => setSelectedPage(null)}>لغو</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setSelectedPage(page)}>
                      ویرایش
                    </button>
                    <button onClick={() => handleDeletePage(page.PageID)}>
                      حذف
                    </button>
                  </>
                )}
                <div className="assign-role-permission">
                  <select
                    onChange={(e) => setSelectedRole(e.target.value)}
                    defaultValue=""
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
                  <button onClick={() => handleAssignRoleToPage(page.PageID)}>
                    تخصیص نقش
                  </button>
                  <select
                    onChange={(e) => setSelectedPermission(e.target.value)}
                    defaultValue=""
                  >
                    <option value="" disabled>
                      انتخاب مجوز
                    </option>
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
                    onClick={() => handleAssignPermissionToPage(page.PageID)}
                  >
                    تخصیص مجوز
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PageManager;
