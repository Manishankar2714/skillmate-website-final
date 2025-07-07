import { signOut } from "next-auth/react";
import { useRouter } from "next/router";

export default function Sidebar({ isDark, unreadCount = 0 }) {
  const router = useRouter();

  const navItems = [
    { icon: "🏠", text: "Home", path: "/dashboard" },
    { icon: "📅", text: "Calendar", path: "/calendar" },
    { icon: "🧾", text: "Services", path: "/services" },
    { icon: "💰", text: "Payments", path: "/payments" },
    { icon: "👤", text: "Profile", path: "/profile" },
    { icon: "📰", text: "Articles", path: "/articles" },
    { icon: "👥", text: "People", path: "/people" }, // People tab
  ];

  return (
    <div
      className={`w-64 h-full p-6 flex flex-col justify-between shadow transition-all duration-300 ${
        isDark
          ? "bg-gray-900 text-gray-200 border-r border-gray-800 shadow-lg"
          : "bg-white text-gray-800 border-r"
      }`}
    >
      <div>
        <h2
          className={`text-2xl font-bold mb-8 ${
            isDark ? "text-green-400" : "text-green-600"
          }`}
        >
          Skillmate
        </h2>
        <ul className="space-y-4 font-medium">
          {navItems.map(({ icon, text, path }, i) => {
            const isPeopleTab = text === "People";
            const isActive = router.pathname === path;

            return (
              <li
                key={i}
                onClick={() => router.push(path)}
                className={`flex items-center justify-between hover:text-green-600 dark:hover:text-green-400 cursor-pointer ${
                  isActive ? "font-bold underline underline-offset-4" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{icon}</span>
                  <span>{text}</span>
                </div>
                {isPeopleTab && unreadCount > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <button
        onClick={() => signOut()}
        className={`w-full font-semibold py-2 px-4 rounded transition ${
          isDark
            ? "bg-red-900 text-red-300 hover:bg-red-800"
            : "bg-red-100 text-red-700 hover:bg-red-200"
        }`}
      >
        Logout
      </button>
    </div>
  );
}
