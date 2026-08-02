import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const Profile = () => {
  const { user, loading, error, refreshUser } = useAuth();

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  if (error) {
    return <div className="rounded-3xl bg-danger/20 p-8 text-mist">{error}</div>;
  }

  if (loading || !user) {
    return <div className="rounded-3xl bg-navy-light p-8 text-steel-light">Loading profile…</div>;
  }

  return (
    <div className="rounded-3xl border border-steel bg-navy-light p-8 shadow-xl shadow-navy/40">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <img
            src={user.avatar}
            alt={user.fullName}
            className="h-24 w-24 rounded-3xl border border-steel object-cover"
          />
          <div>
            <h1 className="text-3xl font-semibold text-mist">{user.fullName}</h1>
            <p className="text-steel-light">@{user.username}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 rounded-3xl border border-steel bg-navy p-6">
        <div>
          <h2 className="text-lg font-semibold text-mist">Email</h2>
          <p className="text-steel-light">{user.email}</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-mist">Joined</h2>
          <p className="text-steel-light">{new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
