import { Routes, Route, NavLink } from 'react-router-dom';
import './index.css';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Profile from './pages/Profile.jsx';
import VideoDetail from './pages/VideoDetail.jsx';
import NotFound from './pages/NotFound.jsx';
import AuthrizationPage from './components/AuthrizationPage.jsx';
import RequireAuth from './components/RequireAuth.jsx';
import { useAuth } from './context/AuthContext.jsx';
import UploadVideo from './pages/UploadVideo.jsx';

function App() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-navy text-mist">
      <header className="border-b border-steel">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <NavLink to="/" className="text-2xl font-bold text-mist">
            YouTube Clone
          </NavLink>
          <nav className="flex items-center gap-4 text-sm text-steel-light">
            {user ? <>
              <NavLink to="/profile" className="hover:text-mist">Profile</NavLink>
              <NavLink to="/upload" className="hover:text-mist">Upload</NavLink>
              <button type="button" onClick={logout} className="hover:text-mist">Logout</button>
            </> : <>
              <NavLink to="/login" className="hover:text-mist">Login</NavLink>
              <NavLink to="/register" className="hover:text-mist">Register</NavLink>
            </>}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<RequireAuth />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/upload" element={<UploadVideo />} />
          </Route>
          <Route path="/video/:videoId" element={<VideoDetail />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/auth" element={<AuthrizationPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
