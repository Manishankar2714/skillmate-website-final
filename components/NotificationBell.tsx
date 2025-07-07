import { useState, useEffect, useRef } from "react";
import { BellIcon } from "@heroicons/react/24/solid";

export default function NotificationBell({
  userName = "USER", // fallback just in case
  isDark,
}: {
  userName: string;
  isDark: boolean;
}) {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  const normalizedUser = userName.toUpperCase();

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/notifications?user=${normalizedUser}`);
      const data = await res.json();
      console.log("🔔 Notifications fetched for:", normalizedUser, data);
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error("❌ Failed to load notifications", err);
    }
  };

  // Initial load + polling
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // refresh every 15 seconds
    return () => clearInterval(interval);
  }, [normalizedUser]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={bellRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        className={`relative p-2 rounded-full shadow transition ${
          isDark ? "bg-gray-800 hover:bg-gray-700 text-white" : "bg-white hover:bg-gray-100 text-gray-700"
        }`}
        title="Notifications"
      >
        <BellIcon className="h-6 w-6" />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 bg-red-600 text-white text-xs px-1.5 rounded-full">
            {notifications.length}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className={`absolute right-0 mt-2 w-72 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto border ${
            isDark ? "bg-gray-900 border-gray-700 text-white" : "bg-white border-gray-200 text-black"
          }`}
        >
          <div className="p-4 border-b font-semibold">Notifications</div>

          {notifications.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">No new notifications</div>
          ) : (
            <ul className="divide-y">
              {notifications.map((note, idx) => (
                <li key={idx} className={`p-3 hover:bg-opacity-10 ${isDark ? "hover:bg-white" : "hover:bg-gray-100"}`}>
                  <p>{note.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(note.timestamp).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
