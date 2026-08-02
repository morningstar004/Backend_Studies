import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { videoApi } from '../api/videoApi.js';

const UploadVideo = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', videoFile: null, thumbnail: null });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true); setError('');
    try {
      const body = new FormData();
      body.append('title', form.title); body.append('description', form.description);
      body.append('videoFile', form.videoFile); body.append('thumbnail', form.thumbnail);
      const result = await videoApi.publish(body);
      navigate(`/video/${result?.data?._id || ''}`);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  return <form onSubmit={submit} className="mx-auto max-w-2xl rounded-3xl border border-steel bg-navy-light p-6">
    <h1 className="text-2xl font-bold text-mist">Publish a video</h1>
    <div className="mt-6 space-y-4">
      <label className="block text-sm text-steel-light">Title<input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1 block w-full rounded-xl border border-steel bg-navy px-3 py-2 text-mist" /></label>
      <label className="block text-sm text-steel-light">Description<textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 block min-h-28 w-full rounded-xl border border-steel bg-navy px-3 py-2 text-mist" /></label>
      <label className="block text-sm text-steel-light">Video file<input required type="file" accept="video/*" onChange={(e) => setForm({ ...form, videoFile: e.target.files?.[0] || null })} className="mt-1 block w-full" /></label>
      <label className="block text-sm text-steel-light">Thumbnail<input required type="file" accept="image/*" onChange={(e) => setForm({ ...form, thumbnail: e.target.files?.[0] || null })} className="mt-1 block w-full" /></label>
    </div>
    {error && <p className="mt-4 rounded-xl bg-danger/20 p-3 text-mist">{error}</p>}
    <button disabled={loading} className="mt-6 rounded-xl bg-mist px-5 py-2.5 font-semibold text-navy disabled:opacity-60">{loading ? 'Uploading…' : 'Publish video'}</button>
  </form>;
};

export default UploadVideo;
