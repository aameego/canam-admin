import { useState } from 'react';
import { useAdminLogin, useForgotPassword } from '../hooks/useAuth.ts';
import { validateAdminLogin, validateForgotPasswordEmail } from '../lib/authAccess.ts';
import { DEV_ADMIN_LOGIN, isDevLoginPrefillEnabled } from '../lib/devLogin.ts';
import { getErrorMessage } from '../lib/getErrorMessage.ts';

type Panel = 'login' | 'forgot' | 'request-access';

const fieldClass =
  'w-full rounded-[6px] border border-line bg-white px-3 py-2.5 font-body text-[14px] text-ink outline-none placeholder:text-muted/70 focus:border-navy';

const labelClass = 'font-display text-[13px] font-bold text-navy';

export default function LoginPage() {
  const login = useAdminLogin();
  const forgot = useForgotPassword();
  const prefill = isDevLoginPrefillEnabled(import.meta.env.DEV);
  const [panel, setPanel] = useState<Panel>('login');
  const [email, setEmail] = useState(prefill ? DEV_ADMIN_LOGIN.email : '');
  const [password, setPassword] = useState(prefill ? DEV_ADMIN_LOGIN.password : '');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const resetAlerts = () => {
    setError('');
    setNotice('');
  };

  const onLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (login.isPending) return;
    resetAlerts();
    const parsed = validateAdminLogin(email, password);
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }
    try {
      await login.mutateAsync({ email: parsed.email, password: parsed.password });
    } catch (err) {
      setError(getErrorMessage(err, 'Login failed. Please try again.'));
    }
  };

  const onForgot = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (forgot.isPending) return;
    resetAlerts();
    const parsed = validateForgotPasswordEmail(email);
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }
    try {
      const message = await forgot.mutateAsync(parsed.email);
      setNotice(message);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not send a reset link. Please try again.'));
    }
  };

  return (
    <main className="flex min-h-dvh items-center justify-center bg-navy px-4 py-8 text-ink">
      <section className="w-full max-w-[550px] rounded-lg bg-white p-5 sm:p-8">
        {panel === 'login' && (
          <>
            <header className="mb-6">
              <h1 className="font-display text-[22px] font-extrabold leading-normal text-navy">Sign In</h1>
              <p className="mt-1.5 font-body text-[14px] text-muted">
                Enter your credentials to access the admin panel.
              </p>
            </header>

            {error && (
              <p className="mb-4 font-body text-[13px] text-canam-red" role="alert">
                {error}
              </p>
            )}

            <form onSubmit={onLogin} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="admin-email" className={labelClass}>
                  Email Address
                </label>
                <input
                  id="admin-email"
                  className={fieldClass}
                  type="email"
                  autoComplete="email"
                  placeholder="manager@can-am.ca"
                  value={email}
                  onChange={(e) => {
                    resetAlerts();
                    setEmail(e.target.value);
                  }}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="admin-password" className={labelClass}>
                  Password
                </label>
                <input
                  id="admin-password"
                  className={fieldClass}
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => {
                    resetAlerts();
                    setPassword(e.target.value);
                  }}
                  required
                />
                <button
                  type="button"
                  className="self-end font-display text-[13px] font-bold text-canam-red underline"
                  onClick={() => {
                    resetAlerts();
                    setPanel('forgot');
                  }}
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={login.isPending}
                className="mt-2 h-11 w-full rounded-[6px] bg-canam-red px-4 font-display text-[13px] font-bold text-white disabled:opacity-70"
              >
                {login.isPending ? 'Signing in...' : 'Sign in'}
              </button>
              {prefill && (
                <p className="font-body text-[12px] text-muted">
                  Local test login is prefilled: {DEV_ADMIN_LOGIN.email} / {DEV_ADMIN_LOGIN.password}
                </p>
              )}
            </form>

            <p className="mt-4 text-center font-body text-[13px] text-muted">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                className="font-bold text-navy underline"
                onClick={() => {
                  resetAlerts();
                  setPanel('request-access');
                }}
              >
                Create New Account
              </button>
            </p>
          </>
        )}

        {panel === 'forgot' && (
          <>
            <header className="mb-6">
              <h1 className="font-display text-[22px] font-extrabold text-navy">Forgot password</h1>
              <p className="mt-1.5 font-body text-[14px] text-muted">
                Enter your admin email and we will send a reset link if the account exists.
              </p>
            </header>
            {error && (
              <p className="mb-4 font-body text-[13px] text-canam-red" role="alert">
                {error}
              </p>
            )}
            {notice && (
              <p className="mb-4 font-body text-[13px] text-navy" role="status">
                {notice}
              </p>
            )}
            <form onSubmit={onForgot} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="forgot-email" className={labelClass}>
                  Email Address
                </label>
                <input
                  id="forgot-email"
                  className={fieldClass}
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    resetAlerts();
                    setEmail(e.target.value);
                  }}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={forgot.isPending}
                className="w-full rounded-[6px] bg-canam-red px-4 py-2.5 font-display text-[13px] font-bold text-white disabled:opacity-70"
              >
                {forgot.isPending ? 'Sending...' : 'Send reset link'}
              </button>
            </form>
            <button
              type="button"
              className="mt-4 font-display text-[13px] font-bold text-navy underline"
              onClick={() => {
                resetAlerts();
                setPanel('login');
              }}
            >
              Back to Sign In
            </button>
          </>
        )}

        {panel === 'request-access' && (
          <>
            <header className="mb-6">
              <h1 className="font-display text-[22px] font-extrabold text-navy">Create New Account</h1>
              <p className="mt-1.5 font-body text-[14px] text-muted">
                Admin accounts are issued by CAN-AM. Wholesale customer signup is on the storefront, not
                here.
              </p>
            </header>
            <button
              type="button"
              className="w-full rounded-[6px] bg-canam-red px-4 py-2.5 font-display text-[13px] font-bold text-white"
              onClick={() => setPanel('login')}
            >
              Back to Sign In
            </button>
          </>
        )}
      </section>
    </main>
  );
}
