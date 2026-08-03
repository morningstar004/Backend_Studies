import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthrizationCard from "../components/authrizationCard.jsx";
import { authApi } from '../api/authApi.js';

const Register = () => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append('fullName', values.fullName || '');
      formData.append('email', values.email || '');
      formData.append('username', values.username || '');
      formData.append('password', values.password || '');
      formData.append('avatar', values.avatar);
      if (values.coverImage) formData.append('coverImage', values.coverImage);

      await authApi.register(formData);

      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-xl justify-center py-6">
      {error && (
        <div className="mb-4 rounded-xl bg-primary/10 p-4 text-primary">
          {error}
        </div>
      )}

      <AuthrizationCard
        fields={["fullName", "email", "username", "password", "avatar", "coverImage"]}
        values={form}
        onChange={handleChange}
        onSubmit={handleSubmit}
        title="Create account"
        submitLabel={loading ? "Creating account..." : "Create account"}
        disabled={loading}
      />
    </div>
  );
};

export default Register;
