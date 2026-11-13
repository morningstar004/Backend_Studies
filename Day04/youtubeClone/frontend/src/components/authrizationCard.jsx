import { useState } from "react";
import { Eye, EyeOff, Image, KeyRound, Lock, Mail, Upload, User } from "lucide-react";

const fieldConfigs = {
  fullName: {
    label: "Full name",
    icon: User,
    type: "text",
    autoComplete: "name",
    placeholder: "Your full name",
  },
  username: {
    label: "Username",
    icon: User,
    type: "text",
    autoComplete: "username",
    placeholder: "Choose a username",
  },
  email: {
    label: "Email address",
    icon: Mail,
    type: "email",
    autoComplete: "email",
    placeholder: "you@example.com",
  },
  password: {
    label: "Password",
    icon: Lock,
    type: "password",
    autoComplete: "current-password",
    placeholder: "Enter your password",
  },
  otp: {
    label: "OTP",
    icon: KeyRound,
    type: "number",
    autoComplete: "one-time-code",
    placeholder: "Enter your OTP",
  },
  avatar: {
    label: "Avatar",
    icon: Upload,
    type: "file",
    accept: "image/*",
    required: true,
  },
  coverImage: {
    label: "Cover image",
    icon: Image,
    type: "file",
    accept: "image/*",
  },
};

export default function AuthrizationCard({
  fields = ["username", "email", "password"],
  values = {},
  onChange = () => {},
  onSubmit = () => {},
  title = "Authorization",
  description = "Please fill in your details",
  showForgotPassword = false,
  forgotPasswordText = "Forgot password?",
  onForgotPassword = () => {},
  submitLabel = "Submit",
  disabled = false,
  optionalFields = [],
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(values);
      }}
      className="surface mx-auto w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-sm"
    >
      <h1 className="text-center text-3xl sm:text-4xl font-bold tracking-tight text-slateDark dark:text-white">
        {title}
      </h1>
      <p className="text-center text-sm mt-2 text-slateDark/60 dark:text-white/60">
        {description}
      </p>
      <div className="mt-6 space-y-4">
        {fields
          .filter((field) => fieldConfigs[field]?.type !== "file")
          .map((field) => {
            const config = fieldConfigs[field];
            const Icon = config?.icon;
            return (
              config && (
                <label key={field} className="block text-sm font-medium">
                  {Icon ? (
                    <div className="group relative mt-1.5 w-full max-w-sm mx-auto">
                      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slateDark/40 transition-colors group-focus-within:text-primary dark:text-white/40">
                        <Icon size={18} />
                      </span>
                      <input
                        required={
                          config.required ??
                          (config.type !== "file" &&
                            !optionalFields.includes(field))
                        }
                        type={
                          field === "password" && showPassword
                            ? "text"
                            : config.type
                        }
                        name={field}
                        autoComplete={config.autoComplete}
                        placeholder={config.placeholder}
                        {...(config.type === "file"
                          ? { accept: config.accept }
                          : { value: values[field] || "" })}
                        onChange={(event) =>
                          onChange(
                            field,
                            config.type === "file"
                              ? event.target.files?.[0] || null
                              : event.target.value,
                          )
                        }
                        className="input pl-10 pr-10 w-full"
                      />
                      {field === "password" && (
                        <button
                          type="button"
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                          onClick={() => setShowPassword((visible) => !visible)}
                          className="absolute inset-y-0 right-3 flex items-center text-slateDark/40 transition group-focus-within:text-primary hover:text-slateDark dark:text-white/40 dark:hover:text-white"
                        >
                          {showPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="w-full max-w-sm mx-auto">
                      <input
                        required={
                          config.required ??
                          (config.type !== "file" &&
                            !optionalFields.includes(field))
                        }
                        type={config.type}
                        name={field}
                        autoComplete={config.autoComplete}
                        placeholder={config.placeholder}
                        {...(config.type === "file"
                          ? { accept: config.accept }
                          : { value: values[field] || "" })}
                        onChange={(event) =>
                          onChange(
                            field,
                            config.type === "file"
                              ? event.target.files?.[0] || null
                              : event.target.value,
                          )
                        }
                        className="input w-full"
                      />
                    </div>
                  )}
                </label>
              )
            );
          })}
        {fields.some((field) => fieldConfigs[field]?.type === "file") && (
          <div className="mt-4 flex flex-wrap justify-center gap-8 sm:gap-12">
            {fields
              .filter((field) => fieldConfigs[field]?.type === "file")
              .map((field) => {
                const config = fieldConfigs[field];
                const Icon = config.icon;
                return (
                  <div key={field} className="flex flex-col items-center gap-2">
                    <label
                      htmlFor={field}
                      className={`flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-primary/10 transition hover:bg-primary/20 ${values[field] ? "text-primary" : "text-slateDark/45 dark:text-white/45"}`}
                      title={config.label}
                    >
                      <Icon size={20} aria-hidden="true" />
                    </label>
                    <span className="text-center -mt-2 text-xs font-semibold">
                      {config.label}
                    </span>
                    <input
                      id={field}
                      required={config.required ?? false}
                      type="file"
                      name={field}
                      accept={config.accept}
                      onChange={(event) =>
                        onChange(field, event.target.files?.[0] || null)
                      }
                      className="sr-only"
                    />
                  </div>
                );
              })}
          </div>
        )}
      </div>
      <div className="mt-6 flex flex-col items-center justify-center gap-2">
        {showForgotPassword ? (
          <button
            type="button"
            className="w-full max-w-sm text-right text-sm mb-1 text-primary hover:text-primary-hover hover:underline"
            onClick={onForgotPassword}
          >
            {forgotPasswordText}
          </button>
        ) : null}
        <button
          disabled={disabled}
          type="submit"
          className="w-full max-w-sm rounded-xl bg-primary px-5 py-2.5 font-semibold text-white shadow-sm transition hover:bg-primary-hover active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
