import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Eye } from "lucide-react";
import { Link, NavLink, useParams } from "react-router-dom";
import {
  playlistService,
  tweetService,
  userService,
  videoService,
} from "../api/services.ts";
import { useAuth } from "../context/AuthContext.jsx";
import { EmptyState, SkeletonCard } from "../components/States.jsx";

const formatDuration = (seconds = 0) => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";

  const totalSeconds = Math.floor(seconds);
  return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, "0")}`;
};

const formatDate = (dateString) =>
  dateString
    ? new Date(dateString).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Date unavailable";

const VideoCard = ({ video, horizontal = false }) => (
  <Link
    to={`/video/${video._id}`}
    className={`group flex gap-3 rounded-xl p-2 transition hover:bg-black/5 dark:hover:bg-white/10 ${
      horizontal ? "items-center" : "flex-col"
    }`}
  >
    <div
      className={`relative shrink-0 overflow-hidden rounded-xl ${horizontal ? "w-44 sm:w-60" : "w-full"}`}
    >
      <img
        src={video.thumbnail}
        alt={video.title}
        className="aspect-video w-full object-cover transition duration-300 group-hover:scale-105"
      />
      <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-[10px] text-white">
        {formatDuration(video.duration)}
      </span>
    </div>
    <div className="min-w-0 space-y-1">
      <h3 className="line-clamp-2 font-semibold">{video.title}</h3>
      <p className="flex items-center gap-1 text-xs text-black/55 dark:text-white/55">
        <Eye size={12} /> {video.views || 0} views <span>·</span>{" "}
        {formatDate(video.createdAt)}
      </p>
    </div>
  </Link>
);

const Profile = () => {
  const { username, section = "home" } = useParams();
  const {
    user: currentUser,
    loading: authLoading,
    error: authError,
  } = useAuth();
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
  const profileBase = username ? `/channel/${username}` : "/profile";
  const activeSection = ["home", "videos", "playlists", "posts"].includes(
    section,
  )
    ? section
    : "home";
  const profileUserId = user?._id;
  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        month: "short",
        year: "numeric",
      })
    : "Not available";

  const videosQuery = useQuery({
    queryKey: ["profile-videos", profileUserId],
    queryFn: () => videoService.list({ userId: profileUserId, limit: 100 }),
    enabled: Boolean(profileUserId),
  });
  const tweetsQuery = useQuery({
    queryKey: ["profile-tweets", profileUserId],
    queryFn: () => tweetService.list(profileUserId),
    enabled: Boolean(profileUserId),
  });
  const playlistsQuery = useQuery({
    queryKey: ["profile-playlists", profileUserId],
    queryFn: () => playlistService.list(profileUserId),
    enabled: Boolean(profileUserId),
  });

  if (error) return <div className="surface p-8 text-primary">{error}</div>;

  if (loading || !user) {
    return <div className="surface animate-pulse p-8">Loading profile…</div>;
  }

  const videos = videosQuery.data?.data?.videos || [];
  const recentVideos = [...videos].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const popularVideos = [...videos].sort(
    (a, b) => (b.views || 0) - (a.views || 0),
  );
  const tweets = tweetsQuery.data?.data || [];
  const playlists = playlistsQuery.data?.data || [];
  const profileContents = [
    { to: profileBase, label: "Home", end: true },
    { to: `${profileBase}/videos`, label: "Videos" },
    { to: `${profileBase}/playlists`, label: "Playlists" },
    { to: `${profileBase}/posts`, label: "Posts" },
  ];

  const renderVideoSection = (title, items, horizontal = false) => (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      {videosQuery.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <SkeletonCard key={item} />
          ))}
        </div>
      ) : videosQuery.error ? (
        <div className="rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm text-primary">
          {videosQuery.error.message || "Failed to load videos."}
        </div>
      ) : items.length ? (
        <div
          className={
            horizontal
              ? "flex gap-3 overflow-x-auto pb-2"
              : "grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
          }
        >
          {items.map((video) => (
            <VideoCard key={video._id} video={video} horizontal={horizontal} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No videos yet"
          detail="Uploaded videos will appear here."
        />
      )}
    </section>
  );

  const renderHome = () => (
    <div className="space-y-8">
      {renderVideoSection("Recently uploaded", recentVideos.slice(0, 6), true)}
      <div className="border-t border-black/10 pt-8 dark:border-white/10">
        {renderVideoSection("All uploaded videos", recentVideos)}
      </div>
      <div className="border-t border-black/10 pt-8 dark:border-white/10">
        {renderVideoSection("Most viewed", popularVideos)}
      </div>
      <div className="border-t border-black/10 pt-8 dark:border-white/10">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Posts and tweets</h2>
          {tweetsQuery.isLoading ? (
            <div className="surface animate-pulse p-8">Loading posts...</div>
          ) : tweets.length ? (
            <div className="space-y-3">
              {tweets.map((tweet) => (
                <article key={tweet._id} className="surface p-4">
                  <p className="whitespace-pre-wrap text-sm">{tweet.caption}</p>
                  {tweet.imageContent && (
                    <img
                      src={tweet.imageContent}
                      alt="Tweet attachment"
                      className="mt-3 max-h-[32rem] w-full rounded-lg object-contain"
                    />
                  )}
                  <p className="mt-2 text-xs text-black/50 dark:text-white/50">
                    {formatDate(tweet.createdAt)}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No posts yet"
              detail="Posts and tweets will appear here."
            />
          )}
        </section>
      </div>
    </div>
  );

  const renderContent = () => {
    if (activeSection === "home") return renderHome();
    if (activeSection === "videos")
      return renderVideoSection("Uploaded videos", recentVideos);
    if (activeSection === "playlists") {
      return playlistsQuery.isLoading ? (
        <div className="surface animate-pulse p-8">Loading playlists...</div>
      ) : playlists.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {playlists.map((playlist) => (
            <div key={playlist._id} className="surface p-4">
              <h2 className="font-semibold">{playlist.name}</h2>
              <p className="mt-1 text-sm text-black/55 dark:text-white/55">
                {playlist.description || "No description"}
              </p>
              <p className="mt-3 text-xs text-black/50 dark:text-white/50">
                {playlist.totalVideos ?? playlist.videos?.length ?? 0} videos
              </p>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No playlists yet"
          detail="Created playlists will appear here."
        />
      );
    }
    return tweetsQuery.isLoading ? (
      <div className="surface animate-pulse p-8">Loading posts...</div>
    ) : tweets.length ? (
      <div className="space-y-3">
        {tweets.map((tweet) => (
          <article key={tweet._id} className="surface p-4">
                <p className="whitespace-pre-wrap text-sm">{tweet.caption}</p>
                {tweet.imageContent && (
                  <img
                    src={tweet.imageContent}
                    alt="Tweet attachment"
                    className="mt-3 max-h-[32rem] w-full rounded-lg object-contain"
                  />
                )}
            <p className="mt-2 text-xs text-black/50 dark:text-white/50">
              {formatDate(tweet.createdAt)}
            </p>
          </article>
        ))}
      </div>
    ) : (
      <EmptyState
        title="No posts yet"
        detail="Posts and tweets will appear here."
      />
    );
  };

  return (
    <div>
      <div className="mx-auto space-y-5">
        <div className="surface overflow-hidden">
          <div
            className="h-64 bg-cover bg-center bg-gradient-to-br from-primary/90 via-primary/50 to-black dark:to-white/10"
            style={
              user.coverImage
                ? {
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.22), rgba(0, 0, 0, 0.22)), url(${user.coverImage})`,
                  }
                : undefined
            }
          />
          <div className="p-5 sm:p-7">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={user.avatar}
                  alt={user.fullName}
                  className="-mt-16 h-44 w-44 rounded-2xl border-4 border-white object-cover dark:border-black"
                />
                <div className="-mt-20">
                  <h1 className="text-3xl font-semibold text-ellipsis leading-wide font-mono">
                    {user.fullName}
                  </h1>
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
                        <p className="mb-2 text-xs font-semibold text-black dark:text-white">
                          Channel details
                        </p>
                        <dl className="space-y-1.5 text-xs text-black/60 dark:text-white/60">
                          <div className="flex justify-between gap-3">
                            <dt>Joined</dt>
                            <dd className="text-right text-black dark:text-white">
                              {joinedDate}
                            </dd>
                          </div>
                          <div className="flex justify-between gap-3">
                            <dt>Subscribers</dt>
                            <dd className="text-black dark:text-white">
                              {user.subscribersCount || 0}
                            </dd>
                          </div>
                          <div className="flex justify-between gap-3">
                            <dt>Videos</dt>
                            <dd className="text-black dark:text-white">
                              {user.videosCount || 0}
                            </dd>
                          </div>
                          <div className="flex justify-between gap-3">
                            <dt>Views</dt>
                            <dd className="text-black dark:text-white">
                              {user.viewsCount || 0}
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </span>
                  </p>
                  <div className="flex items-baseline mt-2 gap-2 text-sm text-black/70 dark:text-white/70">
                    <p>
                      <span className="font-semibold font-mono">
                        {user.subscribersCount || 0}
                      </span>{" "}
                      subscribers
                    </p>
                    <p> | </p>
                    <p>
                      <span className="font-semibold font-mono">
                        {user.videosCount || 0}
                      </span>{" "}
                      videos
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-5 space-y-5">
        <div className="surface">
          <div>
            <div className="sticky top-16 z-20 flex gap-2 overflow-x-auto border-b border-black/10 bg-white/90 px-2 py-2 backdrop-blur-sm dark:border-white/10 dark:bg-black/90">
              {profileContents.map(({ to, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-white shadow-sm"
                        : "text-black/65 hover:bg-black/5 hover:text-black dark:text-white/65 dark:hover:bg-white/10 dark:hover:text-white"
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </div>
            <div className="surface p-5 sm:p-7 rounded-t-none">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
