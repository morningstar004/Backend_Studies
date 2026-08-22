const fieldConfigs = {
  fullName: {
    label: "Full name",
    type: "text",
    autoComplete: "name",
    placeholder: "Your full name",
  },
  username: {
    label: "Username",
    type: "text",
    autoComplete: "username",
    placeholder: "Choose a username",
  },
  email: {
    label: "Email address",
    type: "email",
    autoComplete: "email",
    placeholder: "you@example.com",
  },
  password: {
    label: "Password",
    type: "password",
    autoComplete: "current-password",
    placeholder: "Enter your password",
  },
  otp:{
    label: "OTP",
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
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(values);
      }}
      className="surface w-full p-6 sm:p-8"
    >
      <h1 className="text-center text-2xl font-bold">{title}</h1>
      <div className="mt-6 space-y-4">
        {fields.map((field) => {
          const config = fieldConfigs[field];
          return (
            config && (
              <label key={field} className="block text-sm font-medium">
                {config.label}
                <input
                  required={config.required ?? (config.type !== "file" && !optionalFields.includes(field))}
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
