import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const avatar = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    x="0px"
    y="0px"
    width="24"
    height="24"
    viewBox="0 0 32 32"
    fill="currentColor"
  >
    <path
      fill="currentColor"
      d="M 16 4 C 12.144531 4 9 7.144531 9 11 C 9 13.394531 10.21875 15.519531 12.0625 16.78125 C 8.484375 18.304688 6 21.859375 6 26 L 8 26 C 8 21.535156 11.535156 18 16 18 C 20.464844 18 24 21.535156 24 26 L 26 26 C 26 21.859375 23.515625 18.304688 19.9375 16.78125 C 21.78125 15.519531 23 13.394531 23 11 C 23 7.144531 19.855469 4 16 4 Z M 16 6 C 18.773438 6 21 8.226563 21 11 C 21 13.773438 18.773438 16 16 16 C 13.226563 16 11 13.773438 11 11 C 11 8.226563 13.226563 6 16 6 Z"
    ></path>
  </svg>
);
const key = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    x="0px"
    y="0px"
    width="100"
    height="100"
    viewBox="0 0 24 24"
  >
    <path fill="currentColor" d="M 6.5625 5.0136719 C 2.4595703 5.2668613 -0.68726562 9.0536406 0.13085938 13.369141 C 0.65285938 16.124141 2.8748594 18.347141 5.6308594 18.869141 C 9.378008 19.579519 12.720128 17.298793 13.703125 14 L 18 14 L 18 15 C 18 16.105 18.895 17 20 17 C 21.105 17 22 16.105 22 15 L 22 14 C 23.105 14 24 13.105 24 12 C 24 10.895 23.105 10 22 10 L 13.699219 10 C 12.979424 7.5432523 10.909496 5.6120152 8.3691406 5.1308594 C 7.7527656 5.0139844 7.1486328 4.977502 6.5625 5.0136719 z M 7 9 C 8.657 9 10 10.343 10 12 C 10 13.657 8.657 15 7 15 C 5.343 15 4 13.657 4 12 C 4 10.343 5.343 9 7 9 z"></path>
  </svg>
);
const mail = (
  <svg
    width="24"
    height="24"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M2.5 4C2.5 3.17157 3.17157 2.5 4 2.5H12C12.8284 2.5 13.5 3.17157 13.5 4V12C13.5 12.8284 12.8284 13.5 12 13.5H4C3.17157 13.5 2.5 12.8284 2.5 12V4Z"
      stroke="currentColor"
      stroke-width="1.5"
    />
    <path
      d="M3 4.5L8 8.5L13 4.5"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);
const lock = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    x="0px"
    y="0px"
    width="24"
    height="24"
    viewBox="0 0 24 24"
  >
    <path
      fill="currentColor"
      d="M 12 1 C 8.701247 1 6 3.701247 6 7 L 6 8 L 5.5 8 C 4.1336715 8 3 9.1336715 3 10.5 L 3 18.5 C 3 19.866329 4.1336715 21 5.5 21 L 18.5 21 C 19.866329 21 21 19.866329 21 18.5 L 21 10.5 C 21 9.1336715 19.866329 8 18.5 8 L 18 8 L 18 7 C 18 3.701247 15.298753 1 12 1 z M 12 3.5 C 13.947247 3.5 15.5 5.052753 15.5 7 L 15.5 8 L 8.5 8 L 8.5 7 C 8.5 5.052753 10.052753 3.5 12 3.5 z M 5.5 10.5 L 18.5 10.5 L 18.5 18.5 L 5.5 18.5 L 5.5 10.5 z"
    ></path>
  </svg>
);
const fieldConfigs = {
  fullName: {
    label: "Full name",
    icon: avatar,
    type: "text",
    autoComplete: "name",
    placeholder: "Your full name",
  },
  username: {
    label: "Username",
    icon: avatar,
    type: "text",
    autoComplete: "username",
    placeholder: "Choose a username",
  },
  email: {
    label: "Email address",
    icon: mail,
    type: "email",
    autoComplete: "email",
    placeholder: "you@example.com",
  },
  password: {
    label: "Password",
    icon: lock,
    type: "password",
    autoComplete: "current-password",
    placeholder: "Enter your password",
  },
  otp: {
    label: "OTP",
    icon: key,
    type: "number",
    autoComplete: "one-time-code",
    placeholder: "Enter your OTP",
  },
  avatar: {
    label: "Profile picture",
    type: "file",
    accept: "image/*",
    required: true,
  },
  coverImage: {
    label: "Cover image (optional)",
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
      className="surface rounded-full h-full w-full p-6 sm:p-8"
    >
      <h1 className="text-center text-2xl font-bold">{title}</h1>
      <div className="mt-6 space-y-4">
        {fields.map((field) => {
          const config = fieldConfigs[field];
          return (
            config && (
              <label key={field} className="block text-sm font-medium">
                {config.icon ? (
                  <div className="group relative mt-1.5">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[#8D8D8D] transition-colors group-focus-within:text-primary [&>svg]:h-5 [&>svg]:w-5">
                      {config.icon}
                    </span>
                    <input
                      required={
                        config.required ??
                        (config.type !== "file" && !optionalFields.includes(field))
                      }
                      type={field === "password" && showPassword ? "text" : config.type}
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
                      className="input pl-10 pr-10"
                    />
                    {field === "password" && (
                      <button
                        type="button"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        onClick={() => setShowPassword((visible) => !visible)}
                        className="absolute inset-y-0 right-3 flex items-center text-black/50 transition group-focus-within:text-primary hover:text-black dark:text-white/50 dark:hover:text-white"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    )}
                  </div>
                ) : (
                  <input
                    required={
                      config.required ??
                      (config.type !== "file" && !optionalFields.includes(field))
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
                    className="input mt-1.5"
                  />
                )}
              </label>
            )
          );
        })}
      </div>
      <div className="mt-6 flex items-center justify-between gap-4">
        {showForgotPassword ? (
          <button
            type="button"
            className="text-sm text-primary hover:underline"
            onClick={onForgotPassword}
          >
            {forgotPasswordText}
          </button>
        ) : (
          <span />
        )}
        <button
          disabled={disabled}
          type="submit"
          className="rounded-xl bg-primary px-5 py-2.5 font-semibold text-white transition hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
