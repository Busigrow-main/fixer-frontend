"use client";

import { useEffect, useMemo, useState } from "react";

type Props = { models: string[]; previewCount?: number };

function ModelsSheet({
  models,
  onPick,
  onClose,
}: {
  models: string[];
  onPick: (m: string) => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const list = useMemo(
    () => models.filter((m) => m.toLowerCase().includes(q.trim().toLowerCase())),
    [models, q],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/40 p-3 sm:items-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="All compatible models"
        className="flex max-h-[80dvh] w-full max-w-md flex-col rounded-3xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between px-5 pb-3 pt-4">
          <h3 className="text-lg font-medium text-zinc-900">
            Compatible models <span className="text-sm font-medium text-zinc-400">({models.length})</span>
          </h3>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-600"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="px-5 pb-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search model number"
            aria-label="Search model number"
            className="h-11 w-full rounded-xl bg-zinc-100 px-3.5 text-base outline-none focus:ring-4 focus:ring-primary/10 sm:text-sm"
          />
        </div>

        <ul className="min-h-0 flex-1 divide-y divide-zinc-100 overflow-y-auto px-5 pb-4">
          {list.map((m) => (
            <li key={m}>
              <button
                type="button"
                onClick={() => onPick(m)}
                className="flex h-12 w-full items-center justify-between text-left text-sm font-medium text-zinc-800"
              >
                {m}
                <span className="material-symbols-outlined text-[18px] text-zinc-300">chevron_right</span>
              </button>
            </li>
          ))}
          {list.length === 0 && <li className="py-8 text-center text-sm text-zinc-500">No model found.</li>}
        </ul>
      </div>
    </div>
  );
}

export default function CompatibilityChecker({ models, previewCount = 3 }: Props) {
  const [value, setValue] = useState("");
  const [result, setResult] = useState<{ ok: boolean; model: string } | null>(null);
  const [open, setOpen] = useState(false);

  const check = (raw: string) => {
    const model = raw.trim();
    if (!model) return setResult(null);
    setResult({ ok: models.some((m) => m.toLowerCase() === model.toLowerCase()), model });
  };

  const pick = (m: string) => {
    setValue(m);
    check(m);
    setOpen(false);
  };

  const preview = models.slice(0, previewCount);
  const more = models.length - preview.length;

  return (
    <section className="rounded-2xl border border-zinc-200/80 bg-white p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <span className="material-symbols-outlined text-[22px]">task_alt</span>
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-medium leading-tight text-zinc-900">Check Compatibility</h2>
          <p className="mt-0.5 text-xs leading-snug text-zinc-500">
            Enter your appliance model number to confirm fitment
          </p>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          check(value);
        }}
        className="mt-4 flex gap-2"
      >
        <div className="relative min-w-0 flex-1">
          <label htmlFor="compat-model" className="sr-only">Appliance model number</label>
          <input
            id="compat-model"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setResult(null);
            }}
            placeholder="e.g. FHM1207SDW"
            autoComplete="off"
            className="h-12 w-full rounded-xl bg-zinc-100 pl-3.5 pr-10 text-base text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:[box-shadow:0_0_0_1px_var(--primary,#C8102E),0_0_0_4px_rgba(200,16,46,0.1)] sm:text-sm"
          />
          {value && (
            <button
              type="button"
              aria-label="Clear model number"
              onClick={() => {
                setValue("");
                setResult(null);
              }}
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-zinc-500"
            >
              <span className="material-symbols-outlined text-[18px]">cancel</span>
            </button>
          )}
        </div>
        <button
          type="submit"
          aria-label="Check compatibility"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-[0_8px_16px_-8px_rgba(200,16,46,0.8)] transition active:scale-95"
        >
          <span className="material-symbols-outlined text-[22px]">search</span>
        </button>
      </form>

      {result && (
        <div
          role="status"
          className={`mt-3 flex items-start gap-2 rounded-xl px-3 py-2.5 text-[13px] font-medium ${
            result.ok ? "bg-green-50 text-green-800" : "bg-amber-50 text-amber-900"
          }`}
        >
          <span className="material-symbols-outlined icon-filled mt-px text-[18px]">
            {result.ok ? "check_circle" : "info"}
          </span>
          {result.ok
            ? `Good news: this part fits ${result.model}.`
            : `We couldn't find ${result.model} in the compatible list. Check the number and try again.`}
        </div>
      )}

      <p className="mt-4 text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-500">Compatible models</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {preview.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => pick(m)}
            className="rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-700 transition active:scale-95"
          >
            {m}
          </button>
        ))}
        {more > 0 && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-lg bg-teal-50 px-3 py-1.5 text-xs font-medium text-teal-700 transition active:scale-95"
          >
            +{more} more models
          </button>
        )}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="ml-auto text-xs font-medium text-primary hover:underline"
        >
          View All
        </button>
      </div>

      {open && <ModelsSheet models={models} onPick={pick} onClose={() => setOpen(false)} />}
    </section>
  );
}