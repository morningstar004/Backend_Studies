import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthrizationCard from "../components/authrizationCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const Login = () => {
  const [form, setForm] = useState({ email: "", username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    setError("");

    try {
      await login(values);
      navigate(location.state?.from?.pathname || "/profile", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex justify-center max-w-xl">
      {error && (
        <div className="rounded-2xl bg-red-950/40 p-4 text-mist">
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
        disabled={loading}
      />
    </div>
  );
};

export default Login;
