"use client";

import { CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";

type Props = {
  open: boolean;
  success?: boolean;
  reason: string;
  submitting: boolean;
  onReasonChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
};

export default function OrderCancelDialog({
  open,
  success = false,
  reason,
  submitting,
  onReasonChange,
  onClose,
  onConfirm,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent
        showCloseButton={!submitting}
        onEscapeKeyDown={(event) => submitting && event.preventDefault()}
        onInteractOutside={(event) => submitting && event.preventDefault()}
        className="gap-0 rounded-2xl border-zinc-200 p-0 sm:max-w-md"
      >
        {success ? (
          <>
            <DialogHeader className="items-center px-6 pt-7 text-center sm:text-center">
              <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
              </span>
              <DialogTitle className="text-lg text-zinc-950">Order cancelled</DialogTitle>
              <DialogDescription className="max-w-xs text-sm leading-5">
                Your order has been cancelled successfully.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="p-5 sm:justify-center">
              <Button type="button" onClick={onClose} className="w-full sm:w-auto sm:min-w-32">
                Done
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader className="px-6 pt-6">
              <DialogTitle className="text-lg text-zinc-950">Cancel this order?</DialogTitle>
              <DialogDescription className="text-sm leading-5">
                You can cancel until the order is dispatched. After dispatch, contact Fixxer for a return.
              </DialogDescription>
            </DialogHeader>
            <div className="px-6 pt-5">
              <label htmlFor="shop-order-cancel-reason" className="block text-sm font-medium text-zinc-700">
                Cancellation reason
              </label>
              <textarea
                id="shop-order-cancel-reason"
                value={reason}
                onChange={(event) => onReasonChange(event.target.value)}
                maxLength={500}
                rows={4}
                disabled={submitting}
                placeholder="Tell us why you want to cancel…"
                className="mt-2 w-full resize-y rounded-xl border border-zinc-200 px-3 py-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-60"
              />
              <p className="mt-1 text-right text-xs text-zinc-400">{reason.length}/500</p>
            </div>
            <DialogFooter className="p-5 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" disabled={submitting} onClick={onClose}>
                Keep order
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={submitting || !reason.trim()}
                onClick={onConfirm}
              >
                {submitting ? "Cancelling…" : "Confirm cancellation"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
