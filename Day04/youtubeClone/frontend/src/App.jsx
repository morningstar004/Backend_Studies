import { Routes, Route, NavLink } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Profile from './pages/Profile.jsx';
import VideoDetail from './pages/VideoDetail.jsx';
import NotFound from './pages/NotFound.jsx';
import AuthrizationPage from './components/AuthrizationPage.jsx';

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <NavLink to="/" className="text-2xl font-bold text-cyan-300">
            YouTube Clone
          </NavLink>
          <nav className="space-x-4 text-sm text-slate-300">
            <NavLink to="/login" className="hover:text-white">
              Login
            </NavLink>
            <NavLink to="/register" className="hover:text-white">
              Register
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/video/:videoId" element={<VideoDetail />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/auth" element={<AuthrizationPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
