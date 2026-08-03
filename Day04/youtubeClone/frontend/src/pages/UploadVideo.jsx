import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { videoService } from '../api/services.ts';
import { toast } from 'sonner';
const schema = z.object({ title: z.string().trim().min(1, 'A title is required'), description: z.string().trim().min(1, 'A description is required'), videoFile: z.instanceof(File, { message: 'Select a video file' }), thumbnail: z.instanceof(File, { message: 'Select a thumbnail' }) });

const UploadVideo = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });

  const submit = async (form) => {
    try {
      const body = new FormData();
      body.append('title', form.title); body.append('description', form.description);
      body.append('videoFile', form.videoFile); body.append('thumbnail', form.thumbnail);
      const result = await videoService.publish(body);
      toast.success('Video published');
      navigate(`/video/${result?.data?._id || ''}`);
    } catch (err) { toast.error(err.message); }
  };

  return <form onSubmit={handleSubmit(submit)} className="surface mx-auto max-w-2xl p-5 sm:p-7">
    <h1 className="text-2xl font-bold">Publish a video</h1><p className="mt-1 text-sm text-black/55 dark:text-white/55">Share a new video with your audience.</p>
    <div className="mt-6 space-y-4">
      <label className="block text-sm font-medium">Title<input {...register('title')} className="input mt-1" /></label>{errors.title && <p className="text-xs text-primary">{errors.title.message}</p>}
      <label className="block text-sm font-medium">Description<textarea {...register('description')} className="input mt-1 min-h-28" /></label>{errors.description && <p className="text-xs text-primary">{errors.description.message}</p>}
      <label className="block text-sm font-medium">Video file<input type="file" accept="video/*" onChange={e => setValue('videoFile', e.target.files?.[0], {shouldValidate:true})} className="mt-2 block w-full text-sm" /></label>{errors.videoFile && <p className="text-xs text-primary">{errors.videoFile.message}</p>}
      <label className="block text-sm font-medium">Thumbnail<input type="file" accept="image/*" onChange={e => setValue('thumbnail', e.target.files?.[0], {shouldValidate:true})} className="mt-2 block w-full text-sm" /></label>{errors.thumbnail && <p className="text-xs text-primary">{errors.thumbnail.message}</p>}
    </div>
    <button disabled={isSubmitting} className="mt-6 rounded-xl bg-primary px-5 py-2.5 font-semibold text-white transition hover:brightness-110 active:scale-95 disabled:opacity-60">{isSubmitting ? 'Uploading…' : 'Publish video'}</button>
  </form>;
};

export default UploadVideo;
