import { AnimatePresence, motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Clapperboard,
  Compass,
  Bookmark,
  History,
  Library,
  ListVideo,
  Menu,
  MessageSquareText,
  Plus,
  Search,
  ThumbsUp,
  UsersRound,
  Video,
  X,
} from "lucide-react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import ProfileOption from "./profileOption.jsx";
import SearchPage from "./search.jsx";
import SpeechSearchButton from "./SpeechSearchButton.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { subscriptionService } from "../api/services.ts";
const links = [
  { to: "/", label: "Home", icon: Compass },
  { to: "/subscriptions", label: "Subscriptions", icon: UsersRound },
];
const active = ({ isActive }) =>
  `flex justify-items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${isActive ? "bg-primary text-white" : "hover:bg-black/5 dark:hover:bg-white/10"}`;
export default function AppShell() {
  const [query, setQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopSidebarExpanded, setDesktopSidebarExpanded] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [showAllSubscriptions, setShowAllSubscriptions] = useState(false);
  const profileMenuRef = useRef(null);
  const createMenuRef = useRef(null);
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isVideoPage = location.pathname.startsWith("/video/");
  //trangitional rendering while navigation inside the app, when user clicks on a link, the page will fade out and the new page will fade in
  const profileRoute = location.pathname.match(
    /^(\/profile|\/channel\/[^/]+)(?:\/(?:home|videos|playlists|posts))?\/?$/,
  );
  const pageTransitionKey = profileRoute?.[1] || location.pathname;
  const subscriptionsQuery = useQuery({
    queryKey: ["subscriptions", user?._id],
    queryFn: () => subscriptionService.subscribed(user._id),
    enabled: Boolean(user?._id),
  });
  const subscribedChannels = (subscriptionsQuery.data?.data || [])
    .map((entry) => entry.channel)
    .filter(Boolean);
  const visibleSubscribedChannels = showAllSubscriptions
    ? subscribedChannels
    : subscribedChannels.slice(0, 5);
  const searchFor = (searchQuery) => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return;
    setQuery(trimmedQuery);
    setMobileSearchOpen(false);
    navigate(`/?search=${encodeURIComponent(trimmedQuery)}`);
  };

  const renderSubscribedChannels = (closeMenu = false) => (
    <div className="ml-5 space-y-1 border-l border-black/15 py-1 pl-3 dark:border-white/15">
      <div className="max-h-64 space-y-1 overflow-y-auto">
        {visibleSubscribedChannels.map((channel) => (
          <NavLink
            key={channel._id || channel.username}
            onClick={closeMenu ? () => setMobileMenuOpen(false) : undefined}
            className={({ isActive }) =>
              `flex min-w-0 items-center gap-2 rounded-xl px-2 py-2 text-xs font-medium transition ${isActive ? "bg-primary text-white" : "hover:bg-black/5 dark:hover:bg-white/10"}`
            }
            to={`/channel/${channel.username}`}
          >
            <img
              src={channel.avatar}
              alt=""
              className="h-6 w-6 shrink-0 rounded-full object-cover"
            />
            <span className="truncate">
              {channel.fullName || channel.username}
            </span>
          </NavLink>
        ))}
      </div>
      {subscribedChannels.length > 5 && (
        <button
          type="button"
          onClick={() =>
            setShowAllSubscriptions((isShowingAll) => !isShowingAll)
          }
          aria-expanded={showAllSubscriptions}
          className="w-full rounded-xl px-2 py-2 text-left text-xs font-semibold text-primary hover:bg-black/5 dark:hover:bg-white/10"
        >
          {showAllSubscriptions ? "Show less" : "Show all"}
        </button>
      )}
    </div>
  );

  useEffect(() => {
    if (!profileMenuOpen) return;

    const handlePointerDown = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setProfileMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [profileMenuOpen]);

  useEffect(() => {
    if (!createMenuOpen) return;

    const handlePointerDown = (event) => {
      if (
        createMenuRef.current &&
        !createMenuRef.current.contains(event.target)
      ) {
        setCreateMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") setCreateMenuOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [createMenuOpen]);

  useEffect(() => {
    if (isVideoPage) {
      setDesktopSidebarExpanded(false);
    }
  }, [isVideoPage]);

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
      {user && renderSubscribedChannels(true)}
      <NavLink
        onClick={() => setMobileMenuOpen(false)}
        className={active}
        to="/library"
        end
      >
        <Library size={18} />
        Library
      </NavLink>
      <div className="ml-5 space-y-1 border-l border-black/15 pl-3 dark:border-white/15">
        <NavLink
          onClick={() => setMobileMenuOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${isActive ? "bg-primary text-white" : "hover:bg-black/5 dark:hover:bg-white/10"}`
          }
          to="/library/watchlist"
        >
          <Bookmark size={16} />
          Watchlist
        </NavLink>
        <NavLink
          onClick={() => setMobileMenuOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${isActive ? "bg-primary text-white" : "hover:bg-black/5 dark:hover:bg-white/10"}`
          }
          to="/library/playlists"
        >
          <ListVideo size={16} />
          Playlists
        </NavLink>
        <NavLink
          onClick={() => setMobileMenuOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${isActive ? "bg-primary text-white" : "hover:bg-black/5 dark:hover:bg-white/10"}`
          }
          to="/library/liked-videos"
        >
          <ThumbsUp size={16} />
          Liked videos
        </NavLink>
      </div>
      {/* appears only when user is logged in */}
      {user && (
        <>
          <NavLink className={active} to="/profile" end>
            <img
              className="h-5 w-5 rounded-full object-cover"
              src={user.avatar}
              alt="Your profile"
            />
            Your channel
          </NavLink>
          <div className="ml-5 space-y-1 border-l border-black/15 pl-3 dark:border-white/15">
            <NavLink
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${isActive ? "bg-primary text-white" : "hover:bg-black/5 dark:hover:bg-white/10"}`
              }
              to="/dashboard"
            >
              <Clapperboard size={16} />
              Studio
            </NavLink>
            <NavLink
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${isActive ? "bg-primary text-white" : "hover:bg-black/5 dark:hover:bg-white/10"}`
              }
              to="/history"
            >
              <History size={16} />
              History
            </NavLink>
          </div>
        </>
      )}
    </nav>
  );
  const desktopActive = ({ isActive }) =>
    `flex items-center rounded-xl px-3 py-3 font-medium transition ${
      desktopSidebarExpanded ? "gap-3 text-sm" : "flex-col gap-2 text-[10px]"
    } ${isActive ? "bg-primary text-white" : "hover:bg-black/5 dark:hover:bg-white/10"}`;
  const lapMenu = (
    <nav
      className="space-y-1 -m-1.5"
      onClick={() => isVideoPage && setDesktopSidebarExpanded(false)}
    >
      {/*navigation links on the left side */}
      {links.map(({ to, label, icon: Icon }) => (
        <NavLink className={desktopActive} to={to} key={to}>
          <Icon size={18} />
          <span>{label}</span>
        </NavLink>
      ))}
      {user && desktopSidebarExpanded && renderSubscribedChannels()}
      <NavLink className={desktopActive} to="/library" end>
        <Library size={18} />
        <span>Library</span>
      </NavLink>
      {desktopSidebarExpanded && (
        <div className="ml-5 space-y-1 border-l border-black/15 pl-3 dark:border-white/15">
          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${isActive ? "bg-primary text-white" : "hover:bg-black/5 dark:hover:bg-white/10"}`
            }
            to="/library/watchlist"
          >
            <Bookmark size={16} />
            <span>Watchlist</span>
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${isActive ? "bg-primary text-white" : "hover:bg-black/5 dark:hover:bg-white/10"}`
            }
            to="/library/playlists"
          >
            <ListVideo size={16} />
            <span>Playlists</span>
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${isActive ? "bg-primary text-white" : "hover:bg-black/5 dark:hover:bg-white/10"}`
            }
            to="/library/liked-videos"
          >
            <ThumbsUp size={16} />
            <span>Liked videos</span>
          </NavLink>
        </div>
      )}
      {/* appears only when user is logged in */}
      {user && (
        <>
          <NavLink className={desktopActive} to="/profile">
            <img
              className="h-5 w-5 rounded-full object-cover"
              src={user.avatar}
              alt="Your profile"
            />
            <span>{desktopSidebarExpanded ? "Your channel" : "You"}</span>
          </NavLink>
          {desktopSidebarExpanded && (
            <div className="ml-5 space-y-1 border-l border-black/15 pl-3 dark:border-white/15">
              <NavLink
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${isActive ? "bg-primary text-white" : "hover:bg-black/5 dark:hover:bg-white/10"}`
                }
                to="/dashboard"
              >
                <Clapperboard size={16} />
                <span>Studio</span>
              </NavLink>
              <NavLink
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${isActive ? "bg-primary text-white" : "hover:bg-black/5 dark:hover:bg-white/10"}`
                }
                to="/history"
              >
                <History size={16} />
                <span>History</span>
              </NavLink>
            </div>
          )}
        </>
      )}
    </nav>
  );
  return (
    <div className="min-h-screen bg-white text-[#1A1A1B] transition-colors dark:bg-black dark:text-[#F8F9FA]">
      <header className="sticky top-0 z-30 border-b border-black/10 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-black/80">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center lg:gap-2 lg:px-4 px-2">
          {/* button to open the menu on small screens */}
          <button
            className="icon-button duration-0 lg:translate-x-3"
            onClick={toggleMenu}
            aria-label={desktopSidebarExpanded ? "Close menu" : "Open menu"}
            aria-expanded={desktopSidebarExpanded}
          >
            <Menu size={21} />
          </button>
          <NavLink
            to="/"
            className="flex items-center gap-2 font-bold tracking-tight lg:translate-x-3"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-white">
              <Clapperboard size={18} />
            </span>
            Streamline
          </NavLink>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              searchFor(query);
            }}
            className="relative hidden flex-1 justify-center lg:flex"
          >
            <div className="relative w-full max-w-xl">
              <Search
                className="absolute left-3 top-3 text-black/40 dark:text-white/40"
                size={17}
              />
              <input
                className="input w-full rounded-3xl pl-9 pr-12"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search videos or creators"
              />
              <SpeechSearchButton onSearch={searchFor} />
            </div>
          </form>
          {/* // right side of the header, contains theme toggle and user authentication buttons */}
          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              className="icon-button lg:hidden"
              onClick={() => setMobileSearchOpen(true)}
              aria-label="Open search"
            >
              <Search size={18} />
            </button>

            {/* // user authentication buttons, shows different buttons based on whether the user is logged in or not */}
            {user ? (
              <>
                <div ref={createMenuRef} className="relative hidden sm:block">
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-white transition hover:brightness-110 active:scale-95"
                    onClick={() => setCreateMenuOpen((open) => !open)}
                    aria-expanded={createMenuOpen}
                    aria-haspopup="menu"
                  >
                    <Plus size={17} />
                    Create
                  </button>
                  <AnimatePresence>
                    {createMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.98 }}
                        transition={{ duration: 0.14 }}
                        className="absolute right-0 top-full z-40 mt-2 w-52 overflow-hidden rounded-xl border border-black/10 bg-white py-1 shadow-xl dark:border-white/10 dark:bg-[#111111]"
                        role="menu"
                      >
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setCreateMenuOpen(false);
                            navigate("/upload-video");
                          }}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition hover:bg-black/5 dark:hover:bg-white/10"
                        >
                          <Video size={17} />
                          Upload video
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setCreateMenuOpen(false);
                            navigate("/create-tweet");
                          }}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition hover:bg-black/5 dark:hover:bg-white/10"
                        >
                          <MessageSquareText size={17} />
                          Create tweet
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div ref={profileMenuRef} className="relative">
                  <button
                    className="ml-1 flex items-center gap-2 rounded-full duration-500 p-1.5 hover:bg-black/5 dark:hover:bg-white/10"
                    onClick={() => setProfileMenuOpen((open) => !open)}
                    aria-label="Open profile menu"
                  >
                    <img
                      className="h-7 w-7 rounded-full ring-1 ring-blue-500 ring-opacity-75 transition-opacity hover:ring-opacity-100 ring-offset-white dark:ring-offset-black ring-offset-1 object-cover"
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
                        <ProfileOption
                          onClose={() => setProfileMenuOpen(false)}
                        />
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
      <div className="mx-auto flex w-full bg-white dark:bg-darkBg">
        {isVideoPage ? (
          <AnimatePresence>
            {desktopSidebarExpanded && (
              <motion.aside
                className="fixed left-0 top-16 z-20 hidden h-[calc(100vh-4rem)] w-64 overflow-y-auto border-r border-black/10 bg-white py-4 px-2.5 shadow-xl dark:border-white/10 dark:bg-black lg:block"
                initial={{ x: -256, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -256, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
              >
                {lapMenu}
              </motion.aside>
            )}
          </AnimatePresence>
        ) : (
          <motion.aside
            className="sticky top-16 hidden h-[calc(100vh-4rem)] shrink-0 overflow-hidden border-r border-black/10 py-4 px-2.5 dark:border-white/10 lg:block"
            animate={{ width: desktopSidebarExpanded ? 256 : 92 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            {lapMenu}
          </motion.aside>
        )}
        <main className="min-w-0 flex-1 p-4 sm:p-6">
          <AnimatePresence mode="wait">
            {/* Animates page transitions by fading and sliding each route's content in and out. */}
            <motion.div
              key={pageTransitionKey}
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
      <SearchPage
        open={mobileSearchOpen}
        query={query}
        setQuery={setQuery}
        onClose={() => setMobileSearchOpen(false)}
        onSearch={searchFor}
        onSubmit={(e) => {
          e.preventDefault();
          const trimmedQuery = query.trim();
          if (!trimmedQuery) return;
          setMobileSearchOpen(false);
          navigate(`/?search=${encodeURIComponent(trimmedQuery)}`);
        }}
      />

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
