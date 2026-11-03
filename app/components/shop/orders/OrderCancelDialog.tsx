"use client";

type Props = {
  open: boolean;
  reason: string;
  submitting: boolean;
  onReasonChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
};

export default function OrderCancelDialog({
  open,
  reason,
  submitting,
  onReasonChange,
  onClose,
  onConfirm,
}: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/40 p-4 sm:items-center"
      onClick={() => {
        if (!submitting) onClose();
      }}
    >
      <div
        role="dialog"
        aria-labelledby="shop-order-cancel-title"
        className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="shop-order-cancel-title" className="text-base font-semibold text-zinc-950">
          Cancel this order?
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          You can cancel until the order is dispatched. After dispatch, contact Fixxer for a return.
        </p>
        <label htmlFor="shop-order-cancel-reason" className="mt-4 block text-xs font-medium text-zinc-600">
          Reason
        </label>
        <textarea
          id="shop-order-cancel-reason"
          value={reason}
          onChange={(event) => onReasonChange(event.target.value)}
          maxLength={500}
          rows={4}
          disabled={submitting}
          placeholder="Tell us why you want to cancel…"
          className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-primary"
        />
        <p className="mt-1 text-right text-[11px] text-zinc-400">{reason.length}/500</p>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            disabled={submitting}
            onClick={onClose}
            className="inline-flex h-10 flex-1 items-center justify-center rounded-xl border border-zinc-200 text-sm font-medium text-zinc-700"
          >
            Keep order
          </button>
          <button
            type="button"
            disabled={submitting || !reason.trim()}
            onClick={onConfirm}
            className="inline-flex h-10 flex-1 items-center justify-center rounded-xl bg-rose-600 text-sm font-medium text-white disabled:opacity-50"
          >
            {submitting ? "Cancelling…" : "Confirm cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}
