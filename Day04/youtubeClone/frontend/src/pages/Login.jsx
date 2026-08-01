import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthrizationCard from "../components/authrizationCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const Login = () => {
  const [form, setForm] = useState({ email: "", username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    setError("");

    try {
      await login(values);
      navigate("/profile");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex justify-center max-w-xl">
      {error && (
        <div className="rounded-2xl bg-rose-500/10 p-4 text-rose-200">
          {error}
        </div>
      )}

      <AuthrizationCard
        fields={["email", "username", "password"]}
        values={form}
        onChange={handleChange}
        onSubmit={handleSubmit}
        title="Login"
        showForgotPassword
        forgotPasswordText="Forgot password?"
        onForgotPassword={() =>
          setError("Password recovery is not available yet.")
        }
        submitLabel={loading ? "Signing in..." : "Sign In"}
      />
    </div>
  );
};

export default Login;
