import { useState } from 'react';
import { customerStatusActions, type CustomerStatusAction } from '../lib/customers.ts';
import type { AccountStatus } from '../types/api.ts';

const MENU_CLASS = 'absolute right-0 z-10 rounded-md border border-line bg-white shadow-sm';
const ITEM_CLASS = 'w-full cursor-pointer px-3 py-2 text-left font-display text-[13px] font-bold hover:bg-canvas';

export default function CustomerStatusMenu({
  status,
  positionClass,
  busy,
  onChange,
}: {
  status: AccountStatus;
  positionClass: string;
  busy: boolean;
  onChange: (next: CustomerStatusAction['next']) => void;
}) {
  const [confirming, setConfirming] = useState<CustomerStatusAction | null>(null);

  if (confirming) {
    return (
      <div className={`${MENU_CLASS} ${positionClass} w-64 p-3`} role="alertdialog" aria-label={confirming.label}>
        <p className="font-body text-[13px] text-ink">{confirming.confirm}</p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            className="cursor-pointer rounded-[6px] bg-canam-red px-3 py-1.5 font-display text-[13px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-70"
            onClick={() => onChange(confirming.next)}
            disabled={busy}
          >
            {confirming.label}
          </button>
          <button
            type="button"
            className="cursor-pointer rounded-[6px] px-3 py-1.5 font-display text-[13px] font-bold text-navy hover:bg-canvas"
            onClick={() => setConfirming(null)}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${MENU_CLASS} ${positionClass} w-44 py-1`}>
      {customerStatusActions(status).map((action) => (
        <button
          key={action.next}
          type="button"
          className={`${ITEM_CLASS} ${action.tone === 'danger' ? 'text-canam-red' : 'text-navy'}`}
          onClick={() => (action.confirm ? setConfirming(action) : onChange(action.next))}
          disabled={busy}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
