"use client";

type Props = {
  checked: boolean;
  onChange: (v: boolean) => void;
  fee: number;
  city: string;
};

export default function InstallationAddon({ checked, onChange, fee, city }: Props) {
  return (
    <section className="rounded-2xl border border-zinc-200/80 bg-white p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <span className="material-symbols-outlined icon-filled text-[20px]">build</span>
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-medium leading-tight text-zinc-900">Need Installation?</h2>
          <p className="mt-0.5 text-xs leading-snug text-zinc-500">
            Get it installed by certified Fixxer technicians
          </p>
        </div>
      </div>

      <label
        className={`mt-3.5 flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition ${
          checked ? "border-primary bg-primary/[0.04]" : "border-zinc-200"
        }`}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition peer-focus-visible:ring-4 peer-focus-visible:ring-primary/20 ${
            checked ? "border-primary bg-primary" : "border-zinc-300 bg-white"
          }`}
        >
          {checked && <span className="material-symbols-outlined text-[16px] text-white">check</span>}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-zinc-900">Add Installation Service</span>
            <span className="text-sm font-semibold text-zinc-900">₹{fee.toLocaleString("en-IN")}</span>
          </span>
          <span className="mt-1 block text-xs leading-relaxed text-zinc-500">
            Includes technician visit, precision mounting &amp; test run. Available in {city}.
          </span>
        </span>
      </label>
    </section>
  );
}