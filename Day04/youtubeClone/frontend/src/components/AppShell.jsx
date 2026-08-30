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
  Search,
  X,
} from "lucide-react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import ProfileOption from "./profileOption.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
const links = [
  { to: "/", label: "Home", icon: Compass },
  { to: "/library", label: "Library", icon: Library },
  { to: "/history", label: "History", icon: History },
];
const active = ({ isActive }) =>
  `flex justify-items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${isActive ? "bg-primary text-white" : "hover:bg-black/5 dark:hover:bg-white/10"}`;
export default function AppShell() {
  const [query, setQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopSidebarExpanded, setDesktopSidebarExpanded] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const toggleMenu = () => {
    if (window.matchMedia("(min-width: 1024px)").matches) {
      setDesktopSidebarExpanded((isExpanded) => !isExpanded);
    } else {
      setMobileMenuOpen((isOpen) => !isOpen);
    }
  };
  // menu component for navigation links, the links displayed on the left side of the screen
  const menu = (
    <nav className="space-y-1">
      {/*navigation links on the left side */}
      {links.map(({ to, label, icon: Icon }) => (
        <NavLink
          onClick={() => setMobileMenuOpen(false)}
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
  const desktopActive = ({ isActive }) =>
    `flex items-center rounded-xl px-3 py-3 font-medium transition ${
      desktopSidebarExpanded ? "gap-3 text-sm" : "flex-col gap-2 text-[10px]"
    } ${isActive ? "bg-primary text-white" : "hover:bg-black/5 dark:hover:bg-white/10"}`;
  const lapMenu = (
    <nav className="space-y-1 -m-1.5">
      {/*navigation links on the left side */}
      {links.map(({ to, label, icon: Icon }) => (
        <NavLink className={desktopActive} to={to} key={to}>
          <Icon size={18} />
          <span>{label}</span>
        </NavLink>
      ))}
      {/* appears only when user is logged in */}
      {user && (
        <>
          <NavLink className={desktopActive} to="/dashboard">
            <Clapperboard size={18} />
            <span>Studio</span>
          </NavLink>
          <NavLink className={desktopActive} to="/profile">
            <img
              className="h-5 w-5 rounded-full object-cover"
              src={user.avatar}
              alt="Your profile"
            />
            <span>{desktopSidebarExpanded ? "Your channel" : "You"}</span>
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
            className="icon-button translate-x-3"
            onClick={toggleMenu}
            aria-label="Open menu"
          >
            <Menu size={21}/>
          </button>
          <NavLink
            to="/"
            className="flex items-center gap-2 font-bold tracking-tight translate-x-3"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-white">
              <Clapperboard size={18} />
            </span>
            Streamline
          </NavLink>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              navigate(`/?search=${encodeURIComponent(query.trim())}`);
            }}
            className="relative m-auto max-w-sm flex-1 left-36 hidden lg:block"
          >
            <Search
              className="absolute left-3 top-3 text-black/40 dark:text-white/40"
              size={17}
            />
            <input
              className="input pl-9 rounded-3xl w-full"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search videos"
            />
          </form>
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
                <div className="relative">
                  <button
                    className="ml-1 flex items-center gap-2 rounded-full duration-500 p-1.5 hover:bg-black/5 dark:hover:bg-white/10"
                    onClick={() => setProfileMenuOpen((open) => !open)}
                    aria-label="Open profile menu"
                  >
                    <img
                      className="h-7 w-7 rounded-full ring-1 ring-opacity-75 transition-opacity hover:ring-opacity-100 ring-offset-white dark:ring-offset-black ring-offset-1 object-cover"
                      src={user.avatar}
                      alt="Your profile"
                    />
                  </button>

                  <AnimatePresence>
                    {profileMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.98 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute right-0 top-full z-40 mt-2"
                      >
                        <ProfileOption onClose={() => setProfileMenuOpen(false)} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <NavLink
                  to="/register"
                  className="hidden rounded-xl px-3 py-2 text-sm font-semibold hover:bg-black/5 sm:block dark:hover:bg-white/10"
                >
                  Register
                </NavLink>
                <NavLink
                  to="/login"
                  className="rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-white"
                >
                  Sign in
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-[1600px] bg-white dark:bg-darkBg">
        {/* // left side of the screen, contains navigation links for different pages of the application, hidden on small screens and shown on large screens */}
        <motion.aside
          className="sticky top-16 hidden h-[calc(100vh-4rem)] shrink-0 overflow-hidden border-r border-black/10 p-4 dark:border-white/10 lg:block"
          animate={{ width: desktopSidebarExpanded ? 256 : 100 }}
          transition={{ duration: 0.22, ease: "easeInOut" }}
        >
          {lapMenu}
        </motion.aside>
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
        {mobileMenuOpen && (
          /* Animates the mobile menu overlay and drawer when the menu opens or closes. */
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeIn" }}
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.aside
              className="h-full w-72 bg-white p-4 dark:bg-black"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.3, ease: "easeIn" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6 flex items-center justify-between font-bold">
                <span>Menu</span>
                <button
                  className="icon-button"
                  onClick={() => setMobileMenuOpen(false)}
                >
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
