import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext.jsx";

const ProfileOption = ({ onClose }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const links = [
    { to: "/profile", label: user?.username || "Your profile" },
    { to: "/upload", label: "Add Content" },
    { to: "/dashboard", label: "Studio" },
  ];

  return (
    <div className="w-64 py-4 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-lg dark:border-white/10 dark:bg-[#111111]">
      <div className="border-b border-black/10 px-4 py-3 dark:border-white/10">
        <h5 className="font-bold ">{user.fullName}</h5>
        <NavLink
          to="/profile"
          onClick={onClose}
          className="block text-sm font-semibold text-blue-400 transition hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
        >
          @{user?.username || "Your account"}
        </NavLink>
        <p className="text-xs text-black/60 dark:text-white/60">
          {user?.email || "Signed in"}
        </p>
      </div>

      {links.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onClose}
          className="block px-4 py-3 text-sm transition hover:bg-black/5 dark:hover:bg-white/10"
        >
          {label}
        </NavLink>
      ))}

      <button
        type="button"
        onClick={() => {
          toggleTheme();
          onClose?.();
        }}
        className="flex w-full items-center justify-between border-t border-black/10 px-4 py-3 text-left text-sm transition hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10"
      >
        <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
        {theme === "dark" ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
      </button>

      <button
        type="button"
        onClick={() => {
          logout();
          onClose?.();
        }}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm text-red-500 transition hover:bg-red-500/5 border-t border-black/10 dark:border-white/10"
      >
        Logout
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
};

export default ProfileOption;
