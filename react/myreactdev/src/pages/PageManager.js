import React, { useState, useEffect } from "react";

import "./PageManager.css";
import PagesService from "../services/PagesService";

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

  const fetchPages = async () => {
    try {
      const data = await PagesService.fetchPages();
      setPages(data);
    } catch (err) {
      setError("خطا در دریافت صفحات.");
      console.error(err);
    }
  };

  const fetchRoles = async () => {
    try {
      const data = await PagesService.fetchRoles();
      setRoles(data);
    } catch (err) {
      setError("خطا در دریافت نقش‌ها.");
      console.error(err);
    }
  };
  const fetchPermissions = async () => {
    try {
      const data = await PagesService.fetchPermissions();
      setPermissions(data);
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
      await PagesService.addPage(newPage);
      setNewPage({ PageName: "", PageURL: "" });
      fetchPages();
    } catch (err) {
      setError(err || "خطا در افزودن صفحه.");
      console.error(err);
    }
  };
  const handleEditPage = async (pageId) => {
    if (!selectedPage.PageName || !selectedPage.PageURL) {
      setError("نام و URL صفحه نمی‌تواند خالی باشد.");
      return;
    }
    try {
      await PagesService.editPage(pageId, selectedPage);
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
      await PagesService.deletePage(pageId);
      fetchPages();
    } catch (err) {
      setError("خطا در حذف صفحه.");
      console.error(err);
    }
  };

  const handleAssignRoleToPage = async (pageId) => {
    try {
      await PagesService.assignRoleToPage(pageId, selectedRole);
      fetchPages();
    } catch (err) {
      setError("خطا در تخصیص نقش به صفحه.");
      console.error(err);
    }
  };

  const handleAssignPermissionToPage = async (pageId) => {
    try {
      await PagesService.assignPermissionToPage(pageId, selectedPermission);
      fetchPages();
    } catch (err) {
      setError("خطا در تخصیص مجوز به صفحه.");
      console.error(err);
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
