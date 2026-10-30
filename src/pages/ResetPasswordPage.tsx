import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useResetPassword } from '../hooks/useAuth.ts';
import { validateResetPasswordForm } from '../lib/authAccess.ts';
import { getErrorMessage } from '../lib/getErrorMessage.ts';
import { routes } from '../routes.ts';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = useMemo(() => params.get('token') ?? '', [params]);
  const reset = useResetPassword();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setNotice('');
    const parsed = validateResetPasswordForm(token, password, confirm);
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }
    try {
      const message = await reset.mutateAsync({ token, password });
      setNotice(message || 'Password updated. You can sign in now.');
    } catch (err) {
      setError(getErrorMessage(err, 'Could not reset password. Please try again.'));
    }
  };

  return (
    <main className="flex min-h-dvh items-center justify-center bg-navy px-4 py-8 text-ink">
      <section className="w-full max-w-[550px] rounded-lg bg-white p-5 sm:p-8">
        <h1 className="font-display text-[22px] font-extrabold text-navy">Reset password</h1>
        <p className="mt-1.5 font-body text-[14px] text-muted">Choose a new password for your admin account.</p>

        {(error || !token) && (
          <p className="mt-4 font-body text-[13px] text-canam-red" role="alert">
            {error || 'Reset link is invalid or has expired.'}
          </p>
        )}
        {notice && (
          <p className="mt-4 font-body text-[13px] text-navy" role="status">
            {notice}
          </p>
        )}

        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="new-password" className="font-display text-[13px] font-bold text-navy">
              New password
            </label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              className="w-full rounded-[6px] border border-line px-3 py-2.5 font-body text-[14px] outline-none focus:border-navy"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="confirm-password" className="font-display text-[13px] font-bold text-navy">
              Confirm password
            </label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              className="w-full rounded-[6px] border border-line px-3 py-2.5 font-body text-[14px] outline-none focus:border-navy"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={reset.isPending}
            className="w-full rounded-[6px] bg-canam-red px-4 py-2.5 font-display text-[13px] font-bold text-white disabled:opacity-70"
          >
            {reset.isPending ? 'Saving...' : 'Update password'}
          </button>
        </form>

        <Link to={routes.login} className="mt-4 inline-block font-display text-[13px] font-bold text-navy underline">
          Back to Sign In
        </Link>
      </section>
    </main>
  );
}
