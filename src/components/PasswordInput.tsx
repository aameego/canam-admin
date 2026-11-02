import { useState, type InputHTMLAttributes } from 'react';
import { IconEye, IconEyeOff } from './icons.tsx';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & { id: string };

export default function PasswordInput({ className = '', disabled, ...props }: Props) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input {...props} disabled={disabled} type={visible ? 'text' : 'password'} className={`${className} pr-11`} />
      <button
        type="button"
        className="absolute inset-y-0 right-0 flex w-11 cursor-pointer items-center justify-center text-muted hover:text-navy disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-controls={props.id}
        aria-pressed={visible}
        disabled={disabled}
      >
        {visible ? <IconEyeOff className="size-[18px]" /> : <IconEye className="size-[18px]" />}
      </button>
    </div>
  );
}
