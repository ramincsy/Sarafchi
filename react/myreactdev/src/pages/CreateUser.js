import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AuthContext from "../contexts/AuthContext";
import "./CreateUser.css";

export default function ManageUsers() {
  const navigate = useNavigate();
  const { userInfo } = useContext(AuthContext);

  const [inputs, setInputs] = useState({
    firstName: "",
    lastName: "",
    nationalID: "",
    phoneNumber: "",
    email: "",
    password: "",
    walletAddress: "",
  });
  const [users, setUsers] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [showModal, setShowModal] = useState(false); // کنترل نمایش مودال

  // واکشی لیست کاربران
  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/listusers");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      alert("خطا در دریافت لیست کاربران");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // مدیریت تغییر ورودی‌ها
  const handleChange = (event) => {
    const { name, value } = event.target;
    setInputs((prevInputs) => ({ ...prevInputs, [name]: value }));
  };

  // افزودن یا ویرایش کاربر
  const handleSubmit = async (event) => {
    event.preventDefault();

    const userPayload = {
      FirstName: inputs.firstName,
      LastName: inputs.lastName,
      NationalID: inputs.nationalID,
      PhoneNumber: inputs.phoneNumber,
      Email: inputs.email,
      Password: inputs.password,
      WalletAddress: inputs.walletAddress,
      CreatedBy: userInfo?.name || "Admin",
    };

    try {
      if (editingUser) {
        await axios.put(
          `http://127.0.0.1:5000/userupdate/${editingUser.ID}`,
          userPayload
        );
        alert("کاربر با موفقیت ویرایش شد");
      } else {
        await axios.post("http://127.0.0.1:5000/useradd", userPayload);
        alert("کاربر با موفقیت ایجاد شد");
      }
      setInputs({
        firstName: "",
        lastName: "",
        nationalID: "",
        phoneNumber: "",
        email: "",
        password: "",
        walletAddress: "",
      });
      setEditingUser(null);
      fetchUsers();
      setShowModal(false); // بستن مودال
    } catch (error) {
      console.error("Error saving user:", error);
      alert(
        `خطا در ذخیره کاربر: ${error.response?.data?.error || error.message}`
      );
    }
  };

  // حذف کاربر
  const handleDelete = async (id) => {
    if (window.confirm("آیا مطمئن هستید که می‌خواهید این کاربر را حذف کنید؟")) {
      try {
        await axios.delete(`http://127.0.0.1:5000/userdelete/${id}`);
        alert("کاربر با موفقیت حذف شد");
        fetchUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("خطا در حذف کاربر");
      }
    }
  };

  // شروع ویرایش
  const handleEdit = (user) => {
    setEditingUser(user);
    setInputs({
      firstName: user.FirstName,
      lastName: user.LastName,
      nationalID: user.NationalID,
      phoneNumber: user.PhoneNumber,
      email: user.Email,
      password: "", // نمی‌توان رمز عبور را پر کرد
      walletAddress: user.WalletAddress,
    });
    setShowModal(true); // نمایش مودال
  };

  return (
    <div className="container h-100">
      <div className="row">
        <div className="col-12">
          <h1>مدیریت کاربران</h1>
          <button
            className="btn btn-primary mb-4"
            onClick={() => {
              setEditingUser(null);
              setInputs({
                firstName: "",
                lastName: "",
                nationalID: "",
                phoneNumber: "",
                email: "",
                password: "",
                walletAddress: "",
              });
              setShowModal(true); // نمایش مودال
            }}
          >
            ایجاد کاربر جدید
          </button>
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>نام</th>
                  <th>نام خانوادگی</th>
                  <th>ایمیل</th>
                  <th>شماره تلفن</th>
                  <th>کد ملی</th>
                  <th>عملیات</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.ID}>
                    <td>{user.FirstName}</td>
                    <td>{user.LastName}</td>
                    <td>{user.Email}</td>
                    <td>{user.PhoneNumber}</td>
                    <td>{user.NationalID}</td>
                    <td>
                      <button
                        className="btn btn-warning btn-sm me-2"
                        onClick={() => handleEdit(user)}
                      >
                        ویرایش
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(user.ID)}
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal for User Form */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editingUser ? "ویرایش کاربر" : "ایجاد کاربر جدید"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label>نام</label>
                <input
                  type="text"
                  className="form-control"
                  name="firstName"
                  value={inputs.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label>نام خانوادگی</label>
                <input
                  type="text"
                  className="form-control"
                  name="lastName"
                  value={inputs.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label>کد ملی</label>
                <input
                  type="text"
                  className="form-control"
                  name="nationalID"
                  value={inputs.nationalID}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label>شماره تلفن</label>
                <input
                  type="text"
                  className="form-control"
                  name="phoneNumber"
                  value={inputs.phoneNumber}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label>ایمیل</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={inputs.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label>رمز عبور</label>
                <input
                  type="password"
                  className="form-control"
                  name="password"
                  value={inputs.password}
                  onChange={handleChange}
                  required={!editingUser}
                />
              </div>
              <div className="mb-3">
                <label>آدرس کیف پول</label>
                <input
                  type="text"
                  className="form-control"
                  name="walletAddress"
                  value={inputs.walletAddress}
                  onChange={handleChange}
                />
              </div>
              <button type="submit" className="btn btn-primary">
                {editingUser ? "ذخیره تغییرات" : "ایجاد کاربر"}
              </button>
              <button
                type="button"
                className="btn btn-secondary ms-2"
                onClick={() => setShowModal(false)}
              >
                بستن
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
