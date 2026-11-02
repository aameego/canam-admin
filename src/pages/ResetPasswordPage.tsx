import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PasswordInput from '../components/PasswordInput.tsx';
import { useResetLinkCheck, useResetPassword } from '../hooks/useAuth.ts';
import { RESET_LINK_INVALID, resetLinkState, validateResetPasswordForm } from '../lib/authAccess.ts';
import { PASSWORD_MAX } from '../lib/fields.ts';
import { getErrorMessage } from '../lib/getErrorMessage.ts';
import { routes } from '../routes.ts';

const fieldClass =
  'w-full rounded-[6px] border border-line px-3 py-2.5 font-body text-[14px] outline-none focus:border-navy disabled:cursor-not-allowed disabled:bg-canvas';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = useMemo(() => params.get('token') ?? '', [params]);
  const check = useResetLinkCheck(token);
  const reset = useResetPassword();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const linkState = resetLinkState({
    token,
    check: check.status,
    checkErrorStatus: (check.error as { response?: { status?: number } } | null)?.response?.status,
    submitError: error,
    done: Boolean(notice),
  });
  const formDisabled = linkState !== 'ready' || reset.isPending;

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (formDisabled) return;
    setError('');
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

  const alert = linkState === 'invalid' ? RESET_LINK_INVALID : error;

  return (
    <main className="flex min-h-dvh items-center justify-center bg-navy px-4 py-8 text-ink">
      <section className="w-full max-w-[550px] rounded-lg bg-white p-5 sm:p-8">
        <h1 className="font-display text-[22px] font-extrabold text-navy">Reset password</h1>
        <p className="mt-1.5 font-body text-[14px] text-muted">Choose a new password for your admin account.</p>

        {alert && (
          <p className="mt-4 font-body text-[13px] text-canam-red" role="alert">
            {alert}
            {linkState === 'invalid' && ' Request a new link from the sign-in page.'}
          </p>
        )}
        {linkState === 'checking' && (
          <p className="mt-4 font-body text-[13px] text-muted" role="status">
            Checking your reset link…
          </p>
        )}
        {notice && (
          <p className="mt-4 font-body text-[13px] text-navy" role="status">
            {notice}
          </p>
        )}

        {linkState !== 'done' && (
          <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4" aria-disabled={formDisabled}>
            <fieldset disabled={formDisabled && !reset.isPending} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="new-password" className="font-display text-[13px] font-bold text-navy">
                  New password
                </label>
                <PasswordInput
                  id="new-password"
                  autoComplete="new-password"
                  className={fieldClass}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  maxLength={PASSWORD_MAX}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="confirm-password" className="font-display text-[13px] font-bold text-navy">
                  Confirm password
                </label>
                <PasswordInput
                  id="confirm-password"
                  autoComplete="new-password"
                  className={fieldClass}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  maxLength={PASSWORD_MAX}
                />
              </div>
              <button
                type="submit"
                disabled={formDisabled}
                className="w-full rounded-[6px] bg-canam-red px-4 py-2.5 font-display text-[13px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {reset.isPending ? 'Saving...' : 'Update password'}
              </button>
            </fieldset>
          </form>
        )}

        <Link to={routes.login} className="mt-4 inline-block font-display text-[13px] font-bold text-navy underline">
          {linkState === 'done' ? 'Sign in' : 'Back to Sign In'}
        </Link>
      </section>
    </main>
  );
}
