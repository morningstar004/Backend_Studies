const fieldConfigs = {
  fullName: { label: 'Full name', type: 'text', autoComplete: 'name', placeholder: 'Your full name' },
  username: { label: 'Username', type: 'text', autoComplete: 'username', placeholder: 'Choose a username' },
  email: { label: 'Email address', type: 'email', autoComplete: 'email', placeholder: 'you@example.com' },
  password: { label: 'Password', type: 'password', autoComplete: 'current-password', placeholder: 'Enter your password' },
  avatar: { label: 'Profile picture', type: 'file', accept: 'image/*', required: true },
  coverImage: { label: 'Cover image (optional)', type: 'file', accept: 'image/*' },
};

export default function AuthrizationCard({
  fields = ['username', 'email', 'password'], values = {}, onChange = () => {}, onSubmit = () => {},
  title = 'Authorization', showForgotPassword = false, forgotPasswordText = 'Forgot password?',
  onForgotPassword = () => {}, submitLabel = 'Submit', disabled = false,
}) {
  return (
    <form onSubmit={(event) => { event.preventDefault(); onSubmit(values); }} className="w-full rounded-3xl border border-steel bg-navy-light p-6 shadow-2xl shadow-navy/40">
      <h1 className="text-center text-2xl font-bold text-mist">{title}</h1>
      <div className="mt-6 space-y-4">
        {fields.map((field) => {
          const config = fieldConfigs[field];
          return config && <label key={field} className="block text-sm font-medium text-steel-light">
            {config.label}
            <input
              required={config.required ?? config.type !== 'file'}
              type={config.type}
              name={field}
              autoComplete={config.autoComplete}
              placeholder={config.placeholder}
              {...(config.type === 'file' ? { accept: config.accept } : { value: values[field] || '' })}
              onChange={(event) => onChange(field, config.type === 'file' ? event.target.files?.[0] || null : event.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-steel bg-navy px-3 py-2.5 text-mist outline-none placeholder:text-steel-light focus:border-mist"
            />
          </label>;
        })}
      </div>
      <div className="mt-6 flex items-center justify-between gap-4">
        {showForgotPassword ? <button type="button" className="text-sm text-steel-light hover:text-mist" onClick={onForgotPassword}>{forgotPasswordText}</button> : <span />}
        <button disabled={disabled} type="submit" className="rounded-xl bg-mist px-5 py-2.5 font-semibold text-navy transition hover:bg-steel-light disabled:cursor-not-allowed disabled:opacity-60">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
