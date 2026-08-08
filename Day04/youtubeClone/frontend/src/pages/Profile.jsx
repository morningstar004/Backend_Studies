import { useAuth } from "../context/AuthContext.jsx";

const Profile = () => {
  const { user, loading, error } = useAuth();

  if (error) return <div className="surface p-8 text-primary">{error}</div>;

  if (loading || !user) {
    return <div className="surface animate-pulse p-8">Loading profile…</div>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="surface overflow-hidden">
        <div className="h-36 bg-cover bg-center bg-gradient-to-br from-primary/90 via-primary/50 to-black dark:to-white/10" style={user.coverImage ? { backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.22), rgba(0, 0, 0, 0.22)), url(${user.coverImage})` } : undefined} />
        <div className="p-5 sm:p-7">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <img
                src={user.avatar}
                alt={user.fullName}
                className="-mt-16 h-24 w-24 rounded-2xl border-4 border-white object-cover dark:border-black"
              />
              <div>
                <h1 className="text-3xl font-semibold">{user.fullName}</h1>
                <p className="text-sm text-black/55 dark:text-white/55">
                  @{user.username}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="surface grid gap-4 p-6 sm:grid-cols-2">
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
      </div>
    </div>
  );
};

export default Profile;
