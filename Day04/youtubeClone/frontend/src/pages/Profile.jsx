import { useEffect, useState } from 'react';
import { api } from '../api/apiClient.js';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/users/current-user')
      .then((data) => setProfile(data?.data || null))
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return <div className="rounded-3xl bg-rose-500/10 p-8 text-rose-200">{error}</div>;
  }

  if (!profile) {
    return <div className="rounded-3xl bg-slate-900/80 p-8 text-slate-300">Loading profile…</div>;
  }

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl shadow-slate-950/40">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <img
            src={profile.avatar}
            alt={profile.fullName}
            className="h-24 w-24 rounded-3xl border border-slate-700 object-cover"
          />
          <div>
            <h1 className="text-3xl font-semibold text-white">{profile.fullName}</h1>
            <p className="text-slate-400">@{profile.username}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 rounded-3xl border border-slate-800 bg-slate-950/70 p-6">
        <div>
          <h2 className="text-lg font-semibold text-white">Email</h2>
          <p className="text-slate-400">{profile.email}</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Joined</h2>
          <p className="text-slate-400">{new Date(profile.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
