import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { videoApi } from '../api/videoApi.js';

const VideoDetail = () => {
  const { videoId } = useParams();
  const [video, setVideo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    videoApi.getById(videoId)
      .then((data) => setVideo(data?.data || null))
      .catch((err) => setError(err.message));
  }, [videoId]);

  if (error) {
    return <div className="rounded-3xl bg-danger/20 p-8 text-mist">{error}</div>;
  }

  if (!video) {
    return <div className="rounded-3xl bg-navy-light p-8 text-steel-light">Loading video…</div>;
  }

  return (
    <article className="space-y-8 rounded-3xl border border-steel bg-navy-light p-8 shadow-xl shadow-navy/40">
      <div className="overflow-hidden rounded-3xl bg-navy p-4">
        <video controls className="w-full rounded-3xl bg-black">
          <source src={video.videoFile} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      <div className="space-y-4">
        <h1 className="text-3xl font-semibold text-mist">{video.title}</h1>
        <p className="text-steel-light">{video.description}</p>

        <div className="flex flex-wrap gap-4 text-sm text-steel-light">
          <span>Views: {video.views ?? 0}</span>
          <span>Duration: {video.duration ?? 'N/A'} sec</span>
          <span>Published: {new Date(video.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </article>
  );
};

export default VideoDetail;
