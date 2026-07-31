import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/apiClient.js';

const Register = () => {
  const [form, setForm] = useState({ fullName: '', email: '', username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('fullName', form.fullName);
      formData.append('email', form.email);
      formData.append('username', form.username);
      formData.append('password', form.password);

      await fetch('http://localhost:5000/api/v1/users/register', {
        method: 'POST',
        body: formData,
      }).then(async (response) => {
        if (!response.ok) {
          const result = await response.json();
          throw new Error(result?.message || 'Registration failed');
        }
      });

      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl shadow-slate-950/40">
      <h1 className="text-3xl font-semibold text-white">Register</h1>
      <p className="mt-2 text-slate-400">Create your account to publish and comment on videos.</p>

      {error && <div className="mt-4 rounded-2xl bg-rose-500/10 p-4 text-rose-200">{error}</div>}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block text-sm text-slate-300">
          Full Name
          <input
            type="text"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
            placeholder="Full Name"
          />
        </label>
        <label className="block text-sm text-slate-300">
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
            placeholder="Email"
          />
        </label>
        <label className="block text-sm text-slate-300">
          Username
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
            placeholder="Username"
          />
        </label>
        <label className="block text-sm text-slate-300">
          Password
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
            placeholder="Password"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-cyan-500 px-4 py-3 text-white transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </div>
  );
};

export default Register;
