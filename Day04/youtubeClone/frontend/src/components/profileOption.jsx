import { AnimatePresence, motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Clapperboard, LogOut, Moon, Settings, Sun, Video } from "lucide-react";
import { useTheme } from "../context/ThemeContext.jsx";

const ProfileOption = ({ onClose }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const links = [
    { to: "/settings/profile", label: "Settings", icon: Settings },
    { to: "/upload-video", label: "Add Content", icon: Video },
    { to: "/dashboard", label: "Studio", icon: Clapperboard },
  ];

  return (
    <div
      role="menu"
      className="w-64 overflow-hidden rounded-2xl border border-[#22333B]/10 bg-white py-3 shadow-xl dark:border-white/10 dark:bg-[#141C1E]"
    >
      <div className="border-b border-[#22333B]/10 px-4 py-3 dark:border-white/10">
        <h5 className="font-bold text-slateDark dark:text-white">{user.fullName}</h5>
        <NavLink
          to="/profile"
          onClick={onClose}
          role="menuitem"
          className="block text-sm font-semibold text-primary transition hover:text-primary-hover dark:text-primary dark:hover:text-primary-light"
        >
          @{user?.username || "Your account"}
        </NavLink>
        <p className="text-xs text-slateDark/60 dark:text-white/60">
          {user?.email || "Signed in"}
        </p>
      </div>

      <div className="py-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            role="menuitem"
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slateDark/80 transition hover:bg-black/5 hover:text-slateDark dark:text-white/80 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <Icon className="h-4 w-4 text-primary" />
            {label}
          </NavLink>
        ))}
      </div>

      <button
        type="button"
        onClick={toggleTheme}
        role="menuitem"
        className="flex w-full items-center justify-between border-t border-[#22333B]/10 px-4 py-2.5 text-left text-sm text-slateDark/80 transition hover:bg-black/5 hover:text-slateDark dark:border-white/10 dark:text-white/80 dark:hover:bg-white/10 dark:hover:text-white"
      >
        <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
        <span className="relative grid h-4 w-4 place-items-center">
          <AnimatePresence initial={false}>
            <motion.span
              key={theme}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="absolute inset-0 grid place-items-center"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-accent" />
              ) : (
                <Moon className="h-4 w-4 text-primary" />
              )}
            </motion.span>
          </AnimatePresence>
        </span>
      </button>

      <button
        type="button"
        role="menuitem"
        onClick={() => {
          logout();
          onClose?.();
        }}
        className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-red-500 transition hover:bg-red-500/10 border-t border-[#22333B]/10 dark:border-white/10 font-medium"
      >
        <span>Logout</span>
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
};

export default ProfileOption;
