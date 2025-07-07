import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useState } from "react";

const data = [
  { name: "Likes", value: 120 },
  { name: "Followers", value: 80 },
];

export default function StatsChart() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const theme = localStorage.getItem("dashboard-theme");
    setIsDark(theme === "dark");
  }, []);

  return (
    <div
      className={`w-full h-64 p-4 border rounded-xl shadow-md ${
        isDark ? "bg-gray-800 text-white" : "bg-white text-black"
      }`}
    >
      <h3 className="text-lg font-semibold mb-4">
        Engagement Stats
      </h3>
      <ResponsiveContainer width="100%" height="80%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" stroke={isDark ? "#ffffff" : "#000000"} />
          <YAxis stroke={isDark ? "#ffffff" : "#000000"} />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? "#1f2937" : "#ffffff",
              border: "none",
              color: isDark ? "#ffffff" : "#000000",
            }}
          />
          <Bar
            dataKey="value"
            fill={isDark ? "#10B981" : "#3B82F6"} // Green in dark mode, Blue in light
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
