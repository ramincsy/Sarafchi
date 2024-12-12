import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./ListUserPage.css";

export default function ListUserPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    getUsers();
  }, []);

  function getUsers() {
    axios.get("http://127.0.0.1:5000/listusers").then(function (response) {
      setUsers(response.data);
    });
  }

  const deleteUser = (id) => {
    axios.delete(`http://127.0.0.1:5000/userdelete/${id}`).then(function () {
      getUsers();
    });
    alert("Successfully Deleted");
  };

  return (
    <div className="container">
      <p className="add-user-btn">
        <Link to="/addnewuser" className="btn btn-success">
          Add New User
        </Link>
      </p>
      <h1>List Users</h1>

      {/* جدول برای دستگاه‌های بزرگ‌تر */}
      <table className="table table-bordered table-striped">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Email</th>
            <th>Date Added</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, key) => (
            <tr key={key}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.date}</td>
              <td>
                <Link
                  to={`user/${user.id}/edit`}
                  className="btn btn-success"
                  style={{ marginRight: "10px" }}
                >
                  Edit
                </Link>
                <button
                  onClick={() => deleteUser(user.id)}
                  className="btn btn-danger"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* کارت‌ها برای دستگاه‌های کوچک‌تر */}
      <div className="user-cards">
        {users.map((user, key) => (
          <div className="user-card" key={key}>
            <h3>User #{user.id}</h3>
            <p>
              <strong>Name:</strong> {user.name}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Date Added:</strong> {user.date}
            </p>
            <div className="user-card-actions">
              <Link to={`user/${user.id}/edit`} className="btn btn-success">
                Edit
              </Link>
              <button
                onClick={() => deleteUser(user.id)}
                className="btn btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
