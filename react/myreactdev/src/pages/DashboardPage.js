import React, { useState } from "react";
import "./DashboardPage.css";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// ثبت مقیاس‌ها و کنترل‌کننده‌ها
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const DashboardPage = () => {
  // مدیریت وضعیت باز یا بسته بودن هر باکس به صورت جداگانه
  const [openBoxes, setOpenBoxes] = useState({
    balance: false,
    openTrades: false,
    closedTrades: false,
    suggestedTrades: false,
    liveTrades: false,
    chart: false,
  });

  const toggleBox = (boxName) => {
    setOpenBoxes((prevState) => ({
      ...prevState,
      [boxName]: !prevState[boxName],
    }));
  };

  const balanceData = {
    toman: 12000000,
    tether: 500,
    dollar: 2000,
    yuan: 8000,
  };

  const chartData = {
    labels: [
      "7 روز پیش",
      "6 روز پیش",
      "5 روز پیش",
      "4 روز پیش",
      "3 روز پیش",
      "2 روز پیش",
      "دیروز",
    ],
    datasets: [
      {
        label: "تعداد معاملات",
        data: [5, 8, 4, 6, 7, 9, 12],
        backgroundColor: "#007bff",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "معاملات 7 روز گذشته",
      },
    },
  };

  return (
    <div className="dashboard">
      {/* Balance Box */}
      <div className="box" style={{ backgroundColor: "#ffe5e5" }}>
        <h3 className="box-title" onClick={() => toggleBox("balance")}>
          موجودی‌ها
          <span className="box-toggle-icon">
            {openBoxes.balance ? <FaChevronUp /> : <FaChevronDown />}
          </span>
        </h3>
        {openBoxes.balance && (
          <div className="box-content">
            <p>تومان: {balanceData.toman.toLocaleString()} تومان</p>
            <p>تتر: {balanceData.tether} USDT</p>
            <p>دلار: {balanceData.dollar} USD</p>
            <p>یوان: {balanceData.yuan} CNY</p>
          </div>
        )}
      </div>

      {/* Open Trades */}
      <div className="box" style={{ backgroundColor: "#e5f7ff" }}>
        <h3 className="box-title" onClick={() => toggleBox("openTrades")}>
          معاملات باز
          <span className="box-toggle-icon">
            {openBoxes.openTrades ? <FaChevronUp /> : <FaChevronDown />}
          </span>
        </h3>
        {openBoxes.openTrades && (
          <div className="box-content">
            <p>تعداد: 5 معامله</p>
          </div>
        )}
      </div>

      {/* Closed Trades */}
      <div className="box" style={{ backgroundColor: "#e5ffe5" }}>
        <h3 className="box-title" onClick={() => toggleBox("closedTrades")}>
          معاملات بسته شده
          <span className="box-toggle-icon">
            {openBoxes.closedTrades ? <FaChevronUp /> : <FaChevronDown />}
          </span>
        </h3>
        {openBoxes.closedTrades && (
          <div className="box-content">
            <p>تعداد: 10 معامله</p>
          </div>
        )}
      </div>

      {/* Suggested Trades */}
      <div className="box" style={{ backgroundColor: "#fff5e5" }}>
        <h3 className="box-title" onClick={() => toggleBox("suggestedTrades")}>
          معاملات پیشنهادی
          <span className="box-toggle-icon">
            {openBoxes.suggestedTrades ? <FaChevronUp /> : <FaChevronDown />}
          </span>
        </h3>
        {openBoxes.suggestedTrades && (
          <div className="box-content">
            <p>تعداد: 3 پیشنهاد</p>
          </div>
        )}
      </div>

      {/* Live Trades */}
      <div className="box" style={{ backgroundColor: "#f5e5ff" }}>
        <h3 className="box-title" onClick={() => toggleBox("liveTrades")}>
          معاملات برخط
          <span className="box-toggle-icon">
            {openBoxes.liveTrades ? <FaChevronUp /> : <FaChevronDown />}
          </span>
        </h3>
        {openBoxes.liveTrades && (
          <div className="box-content">
            <p>تعداد: 2 معامله</p>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="box" style={{ backgroundColor: "#e5ffe5" }}>
        <h3 className="box-title" onClick={() => toggleBox("chart")}>
          تعداد معاملات 7 روز گذشته
          <span className="box-toggle-icon">
            {openBoxes.chart ? <FaChevronUp /> : <FaChevronDown />}
          </span>
        </h3>
        {openBoxes.chart && (
          <div className="box-content">
            <Bar data={chartData} options={chartOptions} />
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
