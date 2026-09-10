"use client";

import { useEffect, useState } from "react";

export function LiveClock() {
  const [time, setTime] = useState("19:42");

  useEffect(() => {
    const format = () =>
      new Intl.DateTimeFormat("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(new Date());

    setTime(format());
    const id = window.setInterval(() => setTime(format()), 15000);
    return () => window.clearInterval(id);
  }, []);

  return <span>{time}</span>;
}
