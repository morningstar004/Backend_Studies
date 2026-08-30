import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const ProfileOption = ({ onClose }) => {
  const { user, logout } = useAuth();

  const links = [
    { to: "/profile", label: user?.username || "Your profile" },
    { to: "/upload", label: "Add Content" },
    { to: "/dashboard", label: "Studio" },
  ];

  return (
    <div className="w-56 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-lg dark:border-white/10 dark:bg-[#111111]">
      <div className="border-b border-black/10 px-4 py-3 dark:border-white/10">
        <p className="text-sm font-semibold text-black dark:text-white">
          {user?.username || "Your account"}
        </p>
        <p className="text-xs text-black/60 dark:text-white/60">{user?.email || "Signed in"}</p>
      </div>

      {links.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onClose}
          className="block px-4 py-2 text-sm transition hover:bg-black/5 dark:hover:bg-white/10"
        >
          {label}
        </NavLink>
      ))}

      <button
        type="button"
        onClick={() => {
          logout();
          onClose?.();
        }}
        className="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-red-500 transition hover:bg-red-500/5"
      >
        Log out
      </button>
    </div>
  );
};

export default ProfileOption;
