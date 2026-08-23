import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
    if (!values.email.trim() && !values.username.trim()) {
      setError("Enter either your email address or username.");
      return;
    }
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
    <div className="mx-auto flex-col max-w-xl py-6">
      {error && (
        <div className="mb-4 rounded-xl bg-primary/10 p-4 text-primary">
          {error}
        </div>
      )}
      <AuthrizationCard
        fields={["email", "username", "password"]}
        optionalFields={["email", "username"]}
        values={form}
        onChange={handleChange}
        onSubmit={handleSubmit}
        title="Login"
        description="Sign in to your account"
        showForgotPassword
        forgotPasswordText="Forgot password?"
        onForgotPassword={() => navigate("/forgot-password")}
        submitLabel={loading ? "Signing in..." : "Sign In"}
        disabled={loading}
      />
      <p className="mt-5 text-center text-sm text-black/60 dark:text-white/60">
        New here?{" "}
        <Link
          className="font-semibold text-primary hover:underline"
          to="/register"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
};

export default Login;
