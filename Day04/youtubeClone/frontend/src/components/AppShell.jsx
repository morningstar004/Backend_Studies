import { AnimatePresence, motion } from "framer-motion";
import {
  Clapperboard,
  Compass,
  History,
  Library,
  LogOut,
  Menu,
  Moon,
  Plus,
  Sun,
  X,
} from "lucide-react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
const links = [
  { to: "/", label: "Home", icon: Compass },
  { to: "/library", label: "Library", icon: Library },
  { to: "/history", label: "History", icon: History },
];
const active = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${isActive ? "bg-primary text-white" : "hover:bg-black/5 dark:hover:bg-white/10"}`;
export default function AppShell() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  // menu component for navigation links, the links displayed on the left side of the screen
  const menu = (
    <nav className="space-y-1">
      {/*navigation links on the left side */}
      {links.map(({ to, label, icon: Icon }) => (
        <NavLink
          onClick={() => setOpen(false)}
          className={active}
          to={to}
          key={to}
        >
          <Icon size={18} />
          {label}
        </NavLink>
      ))}
      {/* appears only when user is logged in */}
      {user && (
        <>
          <NavLink className={active} to="/dashboard">
            <Clapperboard size={18} />
            Studio
          </NavLink>
          <NavLink className={active} to="/profile">
            <img
              className="h-5 w-5 rounded-full object-cover"
              src={user.avatar}
              alt="Your profile"
            />
            Your channel
          </NavLink>
        </>
      )}
    </nav>
  );
  return (
    <div className="min-h-screen bg-white text-[#1A1A1B] transition-colors dark:bg-black dark:text-[#F8F9FA]">
      <header className="sticky top-0 z-30 border-b border-black/10 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-black/80">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-2 px-4">
          {/* button to open the menu on small screens */}
          <button
            className="icon-button lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={21} />
          </button>
          <NavLink
            to="/"
            className="flex items-center gap-2 font-bold tracking-tight"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-white">
              <Clapperboard size={18} />
            </span>
            Streamline
          </NavLink>
          {/* // right side of the header, contains theme toggle and user authentication buttons */}
          <div className="ml-auto flex items-center gap-1">
            <button
              className="icon-button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
            </button>
            {/* // user authentication buttons, shows different buttons based on whether the user is logged in or not */}
            {user ? (
              <>
                <button
                  className="hidden items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-white transition hover:brightness-110 active:scale-95 sm:flex"
                  onClick={() => navigate("/upload")}
                >
                  <Plus size={17} />
                  Create
                </button>
                <button
                  className="ml-1 flex items-center gap-2 rounded-xl p-1.5 hover:bg-black/5 dark:hover:bg-white/10"
                  onClick={logout}
                >
                  <img
                    className="h-7 w-7 rounded-lg object-cover"
                    src={user.avatar}
                    alt="Your profile"
                  />
                  <LogOut className="hidden sm:block" size={16} />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <NavLink to="/register" className="hidden rounded-xl px-3 py-2 text-sm font-semibold hover:bg-black/5 sm:block dark:hover:bg-white/10">
                  Register
                </NavLink>
                <NavLink to="/login" className="rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-white">
                  Sign in
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-[1600px] bg-white dark:bg-darkBg">
        {/* // left side of the screen, contains navigation links for different pages of the application, hidden on small screens and shown on large screens */}
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 border-r border-black/10 p-4 dark:border-white/10 lg:block">
          {menu}
        </aside>
        <main className="min-w-0 flex-1 p-4 sm:p-6">
          <AnimatePresence mode="wait">
            {/* Animates page transitions by fading and sliding each route's content in and out. */}
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <AnimatePresence>
        {open && (
          /* Animates the mobile menu overlay and drawer when the menu opens or closes. */
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.aside
              className="h-full w-72 bg-white p-4 dark:bg-black"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6 flex items-center justify-between font-bold">
                <span>Menu</span>
                <button className="icon-button" onClick={() => setOpen(false)}>
                  <X />
                </button>
              </div>
              {menu}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
