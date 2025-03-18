import React, { useState, useEffect } from "react";
import "assets/styles/CircularTimer.css";

const CircularTimer = ({ expirationTime }) => {
  const [timeLeft, setTimeLeft] = useState({ minutes: 0, seconds: 0 });
  const [statusClass, setStatusClass] = useState("timer-status-default");

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(expirationTime).getTime();

      // بررسی معتبر بودن تاریخ
      if (isNaN(expiry)) {
        console.error("Invalid expiration time:", expirationTime);
        return { minutes: 0, seconds: 0 };
      }

      const difference = expiry - now;

      // اگر زمان انقضا گذشته است
      if (difference <= 0) {
        setStatusClass("timer-status-expired"); // وضعیت منقضی شده
        return { minutes: 0, seconds: 0 };
      }

      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      // تعیین وضعیت بر اساس زمان باقی‌مانده
      if (difference < 30000) {
        // کمتر از 30 ثانیه
        setStatusClass("timer-status-critical");
      } else if (difference < 120000) {
        // کمتر از 2 دقیقه
        setStatusClass("timer-status-warning");
      } else {
        setStatusClass("timer-status-default");
      }

      return { minutes, seconds };
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [expirationTime]);

  const radius = 18;
  const circumference = 200 * Math.PI * radius;
  const progress = 1 - (timeLeft.minutes * 60 + timeLeft.seconds) / (200 * 60); // 2 دقیقه کل زمان

  return (
    <div className="circular-timer">
      <svg className="timer-svg">
        <circle className="timer-background" cx="20" cy="20" r={radius} />
        <circle
          className={`timer-progress ${statusClass}`}
          cx="20"
          cy="20"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * progress}
        />
      </svg>
      <div className="timer-text">
        {timeLeft.minutes === 0 && timeLeft.seconds === 0
          ? "Expired" // نمایش "Expired" اگر زمان منقضی شده است
          : `${timeLeft.minutes}:${timeLeft.seconds
              .toString()
              .padStart(2, "0")}`}
      </div>
    </div>
  );
};

export default CircularTimer;
