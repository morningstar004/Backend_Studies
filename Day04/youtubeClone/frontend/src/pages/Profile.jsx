import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const Profile = () => {
  const { user, loading, error, refreshUser } = useAuth();

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  if (error) {
    return <div className="rounded-3xl bg-rose-500/10 p-8 text-rose-200">{error}</div>;
  }

  if (loading || !user) {
    return <div className="rounded-3xl bg-slate-900/80 p-8 text-slate-300">Loading profile…</div>;
  }

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl shadow-slate-950/40">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <img
            src={user.avatar}
            alt={user.fullName}
            className="h-24 w-24 rounded-3xl border border-slate-700 object-cover"
          />
          <div>
            <h1 className="text-3xl font-semibold text-white">{user.fullName}</h1>
            <p className="text-slate-400">@{user.username}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 rounded-3xl border border-slate-800 bg-slate-950/70 p-6">
        <div>
          <h2 className="text-lg font-semibold text-white">Email</h2>
          <p className="text-slate-400">{user.email}</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Joined</h2>
          <p className="text-slate-400">{new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
