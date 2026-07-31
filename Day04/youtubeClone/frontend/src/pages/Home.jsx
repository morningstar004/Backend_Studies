import { useEffect, useState } from 'react';
import { api } from '../api/apiClient.js';
import { Link } from 'react-router-dom';

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/video/getAllVideos')
      .then((data) => setVideos(data?.data?.videos || []))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Latest Videos</h1>
      </div>

      {error ? (
        <div className="rounded-xl bg-rose-500/10 p-4 text-rose-200">{error}</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {videos.map((video) => (
            <Link
              key={video._id}
              to={`/video/${video._id}`}
              className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 p-4 transition hover:-translate-y-1 hover:border-cyan-400/40"
            >
              <div className="h-48 overflow-hidden rounded-2xl bg-slate-800">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="mt-4">
                <h2 className="text-xl font-semibold text-slate-100">{video.title}</h2>
                <p className="mt-2 text-sm text-slate-400">{video.description}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
};

export default Home;
