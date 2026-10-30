import { IconSpinner } from './icons.tsx';

export function BusyLabel({ pending, pendingLabel, idle }: { pending: boolean; pendingLabel: string; idle: string }) {
  return (
    <span className="inline-flex items-center justify-center gap-2">
      {pending ? <IconSpinner className="size-4" /> : null}
      {pending ? pendingLabel : idle}
    </span>
  );
}

export default function BusyOverlay({ label }: { label: string }) {
  return (
    <div
      className="absolute inset-0 z-10 flex items-center justify-center gap-2 bg-white/75"
      role="status"
      aria-live="polite"
    >
      <IconSpinner className="size-5 text-navy" />
      <span className="font-display text-[13px] font-bold text-navy">{label}</span>
    </div>
  );
}
