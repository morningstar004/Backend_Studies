import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/apiClient.js';

const VideoDetail = () => {
  const { videoId } = useParams();
  const [video, setVideo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get(`/video/getVideoById?videoId=${videoId}`)
      .then((data) => setVideo(data?.data || null))
      .catch((err) => setError(err.message));
  }, [videoId]);

  if (error) {
    return <div className="rounded-3xl bg-rose-500/10 p-8 text-rose-200">{error}</div>;
  }

  if (!video) {
    return <div className="rounded-3xl bg-slate-900/80 p-8 text-slate-300">Loading video…</div>;
  }

  return (
    <article className="space-y-8 rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl shadow-slate-950/40">
      <div className="overflow-hidden rounded-3xl bg-slate-950 p-4">
        <video controls className="w-full rounded-3xl bg-black">
          <source src={video.videoFile} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      <div className="space-y-4">
        <h1 className="text-3xl font-semibold text-white">{video.title}</h1>
        <p className="text-slate-400">{video.description}</p>

        <div className="flex flex-wrap gap-4 text-sm text-slate-400">
          <span>Views: {video.views ?? 0}</span>
          <span>Duration: {video.duration ?? 'N/A'} sec</span>
          <span>Published: {new Date(video.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </article>
  );
};

export default VideoDetail;
