"use client";

import { AlertTriangle, CircleHelp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";

type Props = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  busy?: boolean;
  destructive?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ConfirmActionDialog({
  open,
  title,
  description,
  confirmLabel,
  busy = false,
  destructive = false,
  onCancel,
  onConfirm,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && !busy && onCancel()}>
      <DialogContent
        showCloseButton={!busy}
        onEscapeKeyDown={(event) => busy && event.preventDefault()}
        onInteractOutside={(event) => busy && event.preventDefault()}
        className="gap-0 rounded-2xl border-zinc-200 p-0 sm:max-w-md"
      >
        <DialogHeader className="px-6 pt-6">
          <span className={`mb-3 flex h-11 w-11 items-center justify-center rounded-full ${destructive ? "bg-rose-50 text-rose-600" : "bg-teal-50 text-teal-700"}`}>
            {destructive ? (
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            ) : (
              <CircleHelp className="h-5 w-5" aria-hidden="true" />
            )}
          </span>
          <DialogTitle className="text-lg text-zinc-950">{title}</DialogTitle>
          <DialogDescription className="text-sm leading-5">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="p-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold text-white transition disabled:opacity-50 ${destructive ? "bg-primary hover:brightness-105" : "bg-teal-700 hover:bg-teal-800"}`}
          >
            {busy ? "Please wait…" : confirmLabel}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
