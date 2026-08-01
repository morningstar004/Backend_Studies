import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthrizationCard from '../components/authrizationCard.jsx';

const Register = () => {
  const [form, setForm] = useState({ fullName: '', email: '', username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('fullName', values.fullName || '');
      formData.append('email', values.email || '');
      formData.append('username', values.username || '');
      formData.append('password', values.password || '');

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
    <div className="mx-auto flex max-w-xl flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl shadow-slate-950/40">
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-white">Register</h1>
        <p className="mt-2 text-slate-400">Create your account to publish and comment on videos.</p>
      </div>

      {error && <div className="rounded-2xl bg-rose-500/10 p-4 text-rose-200">{error}</div>}

      <AuthrizationCard
        fields={['fullName', 'email', 'username', 'password']}
        values={form}
        onChange={handleChange}
        onSubmit={handleSubmit}
        title="Create account"
        submitLabel={loading ? 'Creating account...' : 'Create account'}
      />
    </div>
  );
};

export default Register;
