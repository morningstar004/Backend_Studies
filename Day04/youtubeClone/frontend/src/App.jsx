import { Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import Profile from "./pages/Profile.jsx";
import VideoDetail from "./pages/VideoDetail.jsx";
import NotFound from "./pages/NotFound.jsx";
import RequireAuth from "./components/RequireAuth.jsx";
import UploadVideo from "./pages/UploadVideo.jsx";
import CreateTweet from "./pages/CreateTweet.jsx";
import AppShell from "./components/AppShell.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import {
  LibraryOverview,
  LikedVideos,
  Playlists,
  Watchlist,
} from "./pages/library/index.js";
import History from "./pages/History.jsx";
import Subscriptions from "./pages/Subscriptions.jsx";
import UpdateVideo from "./pages/UpdateVideo.jsx";
import PlaylistDetail from "./pages/PlaylistDetail.jsx";

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route element={<RequireAuth />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:section" element={<Profile />} />
          <Route path="/upload-video" element={<UploadVideo />} />
          <Route path="/video/:videoId/edit" element={<UpdateVideo />} />
          <Route path="/create-tweet" element={<CreateTweet />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/playlist/:playlistId" element={<PlaylistDetail />} />
          <Route path="/library" element={<LibraryOverview />} />
          <Route path="/library/watchlist" element={<Watchlist />} />
          <Route path="/library/playlists" element={<Playlists />} />
          <Route path="/library/liked-videos" element={<LikedVideos />} />
          <Route
            path="/watchlist"
            element={<Navigate to="/library/watchlist" replace />}
          />
          <Route
            path="/liked-videos"
            element={<Navigate to="/library/liked-videos" replace />}
          />
          <Route path="/history" element={<History />} />
          <Route path="/subscriptions" element={<Subscriptions />} />
        </Route>
        <Route path="/channel/:username" element={<Profile />} />
        <Route path="/channel/:username/:section" element={<Profile />} />
        <Route path="/video/:videoId" element={<VideoDetail />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
