"use client";

export type Spec = { label: string; value: string };

type Props = { specs: Spec[]; cols?: "2" | "4" };

export default function SpecsGrid({ specs, cols = "2" }: Props) {
  return (
    <dl className={`grid gap-2.5 ${cols === "4" ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-2"}`}>
      {specs.map((s) => (
        <div key={s.label} className="rounded-xl bg-zinc-100 px-3.5 py-3">
          <dt className="text-[11px] text-zinc-500">{s.label}</dt>
          <dd className="mt-0.5 text-[13px] font-medium text-zinc-900">{s.value}</dd>
        </div>
      ))}
    </dl>
  );
}