import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import AuthrizationCard from "../components/authrizationCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const getLoginErrorMessage = (message = "") => {
  const normalized = String(message).toLowerCase();

  if (normalized.includes("credential missing") || normalized.includes("username is required") || normalized.includes("email is required")) {
    return "Username or email is required.";
  }

  if (normalized.includes("user does not exist") || normalized.includes("user not found") || normalized.includes("no user")) {
    return "User does not exist.";
  }

  if (normalized.includes("invalid password") || normalized.includes("password wrong") || normalized.includes("wrong password")) {
    return "Password is wrong.";
  }

  if (normalized.includes("username") && (normalized.includes("incorrect") || normalized.includes("invalid"))) {
    return "Username is incorrect.";
  }

  return message || "Login failed.";
};

const Login = () => {
  const [form, setForm] = useState({ email: "", username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (values) => {
    if (!values.email.trim() && !values.username.trim()) {
      toast.error("Username or email is required.");
      return;
    }

    setLoading(true);

    try {
      await login(values);
      navigate(location.state?.from?.pathname || "/", { replace: true });
    } catch (err) {
      const message = getLoginErrorMessage(err?.message || "Login failed.");
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex-col max-w-xl py-6">
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
