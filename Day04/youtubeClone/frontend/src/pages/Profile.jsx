import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { userService } from "../api/services.ts";
import { useAuth } from "../context/AuthContext.jsx";

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser, loading: authLoading, error: authError } = useAuth();
  const [channelUser, setChannelUser] = useState(null);
  const [channelLoading, setChannelLoading] = useState(Boolean(username));
  const [channelError, setChannelError] = useState(null);

  useEffect(() => {
    if (!username) {
      setChannelUser(null);
      setChannelLoading(false);
      setChannelError(null);
      return;
    }

    let ignore = false;

    const loadChannel = async () => {
      setChannelLoading(true);
      setChannelError(null);

      try {
        const response = await userService.channel(username);
        if (!ignore) {
          setChannelUser(response?.data || null);
        }
      } catch (error) {
        if (!ignore) {
          setChannelError(error.message || "Failed to load channel profile.");
        }
      } finally {
        if (!ignore) {
          setChannelLoading(false);
        }
      }
    };

    loadChannel();

    return () => {
      ignore = true;
    };
  }, [username]);

  const user = username ? channelUser : currentUser;
  const loading = username ? channelLoading : authLoading;
  const error = username ? channelError : authError;
  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        month: "short",
        year: "numeric",
      })
    : "Not available";

  if (error) return <div className="surface p-8 text-primary">{error}</div>;

  if (loading || !user) {
    return <div className="surface animate-pulse p-8">Loading profile…</div>;
  }

  return (
    <div className="mx-auto space-y-5">
      <div className="surface overflow-hidden">
        <div className="h-64 bg-cover bg-center bg-gradient-to-br from-primary/90 via-primary/50 to-black dark:to-white/10" style={user.coverImage ? { backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.22), rgba(0, 0, 0, 0.22)), url(${user.coverImage})` } : undefined} />
        <div className="p-5 sm:p-7">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <img
                src={user.avatar}
                alt={user.fullName}
                className="-mt-16 h-44 w-44 rounded-2xl border-4 border-white object-cover dark:border-black"
              />
              <div className="-mt-20">
                <h1 className="text-3xl font-semibold text-ellipsis leading-wide font-mono">{user.fullName}</h1>
                <p className="text-sm text-black/45 dark:text-white/45 gap-1 flex">
                  <span>@{user.username}</span>
                  <span className="group relative inline-flex">
                    <button
                      type="button"
                      aria-label="Show channel details"
                      className="rounded-full bg-white/20 px-[0.580rem] py-0.5 font-mono text-[10px] text-white outline-none transition-colors hover:bg-white/35 focus-visible:bg-white/35 dark:text-white"
                    >
                      !
                    </button>
                    <div
                      role="tooltip"
                      className="pointer-events-none absolute left-7 -top-10 z-20 mt-0.5 w-52 origin-bottom-right rounded-xl border border-black/10 bg-white p-3 text-left opacity-0 shadow-xl transition-all duration-500 ease-out group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100 dark:border-white/15 dark:bg-zinc-900"
                    >
                      <p className="mb-2 text-xs font-semibold text-black dark:text-white">Channel details</p>
                      <dl className="space-y-1.5 text-xs text-black/60 dark:text-white/60">
                        <div className="flex justify-between gap-3"><dt>Joined</dt><dd className="text-right text-black dark:text-white">{joinedDate}</dd></div>
                        <div className="flex justify-between gap-3"><dt>Subscribers</dt><dd className="text-black dark:text-white">{user.subscribersCount || 0}</dd></div>
                        <div className="flex justify-between gap-3"><dt>Videos</dt><dd className="text-black dark:text-white">{user.videosCount || 0}</dd></div>
                        <div className="flex justify-between gap-3"><dt>Views</dt><dd className="text-black dark:text-white">{user.viewsCount || 0}</dd></div>
                      </dl>
                    </div>
                  </span>
                </p>
                <div className="flex items-baseline mt-2 gap-2 text-sm text-black/70 dark:text-white/70"> 
                  <p>
                    <span className="font-semibold font-mono">{user.subscribersCount || 0}</span> subscribers
                  </p>
                  <p>| |</p>
                  <p>
                    <span className="font-semibold font-mono">{user.videosCount || 0}</span> videos
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <div className="surface grid gap-4 p-6 sm:grid-cols-2">
        <div>
          <h2 className="text-sm font-semibold">Email</h2>
          <p className="text-sm text-black/55 dark:text-white/55">
            {user.email}
          </p>
        </div>
        <div>
          <h2 className="text-sm font-semibold">Joined</h2>
          <p className="text-sm text-black/55 dark:text-white/55">
            {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div> */}
    </div>
  );
};

export default Profile;
