import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const RequireAuth = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <p className="rounded-2xl bg-navy-light p-6 text-mist">Checking your session…</p>;

  return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />;
};

export default RequireAuth;
