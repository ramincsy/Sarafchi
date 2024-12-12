import React, { forwardRef } from "react";
import { Link } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = forwardRef(({ isVisible }, ref) => {
  return (
    <nav ref={ref} className={`sidebar ${isVisible ? "visible" : ""}`}>
      <div className="sidebar-header">
        <img
          src="https://via.placeholder.com/60"
          alt="User"
          className="sidebar-avatar"
        />
        <h2 className="sidebar-name">رامین</h2>
        <p className="sidebar-role">مدیر</p>
      </div>
      <ul className="sidebar-menu">
        <li>
          <Link to="/">صفحه اصلی</Link>
        </li>
        <li>
          <Link to="/addnewuser">افزودن کاربر</Link>
        </li>
        <li>
          <Link to="/listusers">لیست کاربران</Link>
        </li>
        <li>
          <Link to="/automatic-transaction">معامله اتوماتیک </Link>
        </li>
        <li>
          <Link to="/suggested-transaction">معامله پیشنهادی </Link>
        </li>
        <li>
          <Link to="/live-transaction">معامله روی خط </Link>
        </li>
        <li>
          <Link to="/balances">موجودی</Link>
        </li>
        <li>
          <Link to="/AdminDashboard">داشبورد ادمین</Link>
        </li>
        <li>
          <Link to="/deposit">واریز</Link>
        </li>
      </ul>
      <div className="sidebar-footer">
        <button className="sidebar-darkmode">حالت روشن / حالت تاریک</button>
      </div>
    </nav>
  );
});

export default Sidebar;
