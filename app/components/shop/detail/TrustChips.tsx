"use client";

export type Trust = { icon: string; label: string };

export default function TrustChips({ items }: { items: Trust[] }) {
  return (
    <ul className="no-scrollbar -mx-3 flex gap-2 overflow-x-auto px-3 sm:-mx-4 sm:px-4 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0">
      {items.map((t) => (
        <li
          key={t.label}
          className="inline-flex shrink-0 items-center gap-2 rounded-full border border-zinc-200 bg-white py-1.5 pl-1.5 pr-3.5 text-xs font-semibold text-zinc-800"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
            <span className="material-symbols-outlined icon-filled text-[16px]">{t.icon}</span>
          </span>
          {t.label}
        </li>
      ))}
    </ul>
  );
}