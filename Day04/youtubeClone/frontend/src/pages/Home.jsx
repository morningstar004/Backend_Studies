import { useEffect, useState } from 'react';
import { videoApi } from '../api/videoApi.js';
import { Link } from 'react-router-dom';

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    videoApi.list()
      .then((data) => setVideos(data?.data?.videos || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Latest Videos</h1>
      </div>

      {loading ? <p className="text-steel-light">Loading videos…</p> : error ? (
        <div className="rounded-xl bg-danger/20 p-4 text-mist">{error}</div>
      ) : videos.length === 0 ? (
        <p className="rounded-xl bg-navy-light p-6 text-steel-light">No videos have been published yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {videos.map((video) => (
            <Link
              key={video._id}
              to={`/video/${video._id}`}
              className="overflow-hidden rounded-3xl border border-steel bg-navy-light p-4 transition hover:-translate-y-1 hover:border-steel-light"
            >
              <div className="h-48 overflow-hidden rounded-2xl bg-steel">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="mt-4">
                <h2 className="text-xl font-semibold text-mist">{video.title}</h2>
                <p className="mt-2 text-sm text-steel-light">{video.description}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
};

export default Home;
