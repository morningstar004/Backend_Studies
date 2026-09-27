import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../api/authApi.js";

const initialResetForm = {
  email: "",
  otp: "",
  newPassword: "",
  confirmPassword: "",
};

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [resetForm, setResetForm] = useState(initialResetForm);
  const [step, setStep] = useState("request");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const requestOtp = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await authApi.forgotPassword(email);
      setResetForm((current) => ({ ...current, email }));
      setMessage(
        response.message ||
          "If that address is registered, an OTP has been sent.",
      );
      setStep("reset");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await authApi.resetPassword(resetForm);
      setMessage(
        response.message || "Password reset successfully. You can now sign in.",
      );
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl py-6">
      <form
        className="surface p-6 sm:p-8"
        onSubmit={step === "request" ? requestOtp : resetPassword}
      >
        <h1 className="text-center text-2xl font-bold">Reset your password</h1>
        <p className="mt-2 text-center text-sm text-black/60 dark:text-white/60">
          {step === "request"
            ? "We’ll email you a four-digit OTP."
            : "Enter the OTP from your email and choose a new password."}
        </p>
        {error && (
          <p className="mt-5 rounded-xl bg-primary/10 p-3 text-sm text-primary">
            {error}
          </p>
        )}
        {message && (
          <p className="mt-5 rounded-xl bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-300">
            {message}
          </p>
        )}
        <div className="mt-6 space-y-4">
          {step === "request" ? (
            <label className="block text-sm font-medium">
              Email address
              <input
                required
                type="email"
                autoComplete="email"
                className="input mt-1.5"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
          ) : (
            <>
              <label className="block text-sm font-medium">
                OTP
                <input
                  required
                  inputMode="numeric"
                  pattern="[0-9]{4}"
                  maxLength="4"
                  className="input mt-1.5"
                  placeholder="Four-digit OTP"
                  value={resetForm.otp}
                  onChange={(event) =>
                    setResetForm((current) => ({
                      ...current,
                      otp: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="block text-sm font-medium">
                New password
                <input
                  required
                  type="password"
                  minLength="6"
                  autoComplete="new-password"
                  className="input mt-1.5"
                  value={resetForm.newPassword}
                  onChange={(event) =>
                    setResetForm((current) => ({
                      ...current,
                      newPassword: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="block text-sm font-medium">
                Confirm new password
                <input
                  required
                  type="password"
                  minLength="6"
                  autoComplete="new-password"
                  className="input mt-1.5"
                  value={resetForm.confirmPassword}
                  onChange={(event) =>
                    setResetForm((current) => ({
                      ...current,
                      confirmPassword: event.target.value,
                    }))
                  }
                />
              </label>
            </>
          )}
        </div>
        <div className="mt-6 flex items-center justify-between gap-4">
          <Link className="text-sm text-primary hover:underline" to="/login">
            Back to sign in
          </Link>
          <button
            disabled={loading}
            className="rounded-xl bg-primary px-5 py-2.5 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Please wait..."
              : step === "request"
                ? "Send OTP"
                : "Reset password"}
          </button>
        </div>
      </form>
    </div>
  );
}
