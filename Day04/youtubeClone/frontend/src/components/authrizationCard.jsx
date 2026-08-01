import React from 'react';

const fieldConfigs = {
  fullName: {
    label: 'Full Name',
    type: 'text',
    name: 'fullName',
    autoComplete: 'name',
    placeholder: 'Enter full name',
  },
  username: {
    label: 'Username',
    type: 'text',
    name: 'username',
    autoComplete: 'username',
    placeholder: 'Enter username',
  },
  email: {
    label: 'Email',
    type: 'email',
    name: 'email',
    autoComplete: 'email',
    placeholder: 'Enter email',
  },
  password: {
    label: 'Password',
    type: 'password',
    name: 'password',
    autoComplete: 'current-password',
    placeholder: 'Enter password',
  },
};

const cardStyles = {
  wrapper: {
    width: '360px',
    aspectRatio: '16 / 9',
    maxWidth: '100%',
    minHeight: '240px',
    padding: '18px',
    borderRadius: '18px',
    background: 'var(--card)',
    boxShadow: '0 18px 40px var(--card-shadow-color)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: '12px',
    fontFamily: 'var(--font-family)',
  },
  title: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: 700,
    color: 'var(--foreground)',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    flex: 1,
    overflow: 'auto',
  },
  fieldLabel: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--muted-foreground)',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '12px',
    border: '1px solid var(--card-border-color)',
    background: 'var(--card-input-bg)',
    fontSize: '0.95rem',
    color: 'var(--foreground)',
    outline: 'none',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  forgot: {
    background: 'none',
    border: 'none',
    color: 'var(--accent)',
    cursor: 'pointer',
    fontSize: '0.88rem',
    padding: 0,
  },
  submit: {
    flex: '1 1 auto',
    minWidth: '120px',
    padding: '10px 14px',
    borderRadius: '12px',
    border: 'none',
    background: 'var(--accent)',
    color: 'var(--accent-foreground)',
    fontWeight: 700,
    cursor: 'pointer',
  },
};

export default function AuthrizationCard({
  fields = ['username', 'email', 'password'],
  values = {},
  onChange = () => {},
  onSubmit = () => {},
  title = 'Authorization',
  showForgotPassword = false,
  forgotPasswordText = 'Forgot password?',
  onForgotPassword = () => {},
  submitLabel = 'Submit',
}) {
  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(values);
  };

  return (
    <div style={cardStyles.wrapper}>
      <form style={{ display: 'flex', flexDirection: 'column', height: '100%' }} onSubmit={handleSubmit}>
        <h3 style={cardStyles.title}>{title}</h3>

        <div style={cardStyles.fieldGroup}>
          {fields.map((fieldKey) => {
            const config = fieldConfigs[fieldKey];
            if (!config) return null;

            return (
              <label key={fieldKey} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={cardStyles.fieldLabel}>{config.label}</span>
                <input
                  style={cardStyles.input}
                  type={config.type}
                  name={config.name}
                  placeholder={config.placeholder}
                  value={values[config.name] || ''}
                  onChange={(event) => onChange(config.name, event.target.value)}
                  autoComplete={config.autoComplete}
                />
              </label>
            );
          })}
        </div>

        <div style={cardStyles.footer}>
          {showForgotPassword && (
            <button type="button" style={cardStyles.forgot} onClick={onForgotPassword}>
              {forgotPasswordText}
            </button>
          )}
          <button type="submit" style={cardStyles.submit}>
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
