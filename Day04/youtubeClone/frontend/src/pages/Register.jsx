import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import AuthrizationCard from "../components/authrizationCard.jsx";
import { authApi } from "../api/authApi.js";

const getRegisterErrorMessage = (message = "") => {
  const normalized = String(message).toLowerCase();

  if (normalized.includes("full name") && normalized.includes("required")) {
    return "Full name is required.";
  }

  if (normalized.includes("email") && normalized.includes("required")) {
    return "Email is required.";
  }

  if (normalized.includes("username") && normalized.includes("required")) {
    return "Username is required.";
  }

  if (normalized.includes("password") && normalized.includes("required")) {
    return "Password is required.";
  }

  if (normalized.includes("email") && (normalized.includes("already") || normalized.includes("exists"))) {
    return "This email is already in use.";
  }

  if (normalized.includes("username") && (normalized.includes("already") || normalized.includes("exists"))) {
    return "This username is already taken.";
  }

  if (normalized.includes("invalid email") || normalized.includes("email is invalid")) {
    return "Please enter a valid email address.";
  }

  return message || "Registration failed.";
};

const Register = () => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (values) => {
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("fullName", values.fullName || "");
      formData.append("email", values.email || "");
      formData.append("username", values.username || "");
      formData.append("password", values.password || "");
      formData.append("avatar", values.avatar);
      if (values.coverImage) formData.append("coverImage", values.coverImage);

      await authApi.register(formData);

      navigate("/login");
    } catch (err) {
      toast.error(getRegisterErrorMessage(err?.message || "Registration failed."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl max-h-screen py-6">
      <AuthrizationCard
        fields={[
          "fullName",
          "email",
          "username",
          "password",
          "avatar",
          "coverImage",
        ]}
        values={form}
        onChange={handleChange}
        onSubmit={handleSubmit}
        title="Sign Up"
        description="Create a new account"
        submitLabel={loading ? "Creating account..." : "Create account"}
        disabled={loading}
      />
      <p className="mt-5 text-center text-sm text-black/60 dark:text-white/60">
        Already have an account?{" "}
        <Link
          className="font-semibold text-primary hover:underline"
          to="/login"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default Register;
