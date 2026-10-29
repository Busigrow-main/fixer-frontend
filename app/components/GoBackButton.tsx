
"use client";

export default function GoBackButton() {
  return (
    <button
      type="button"
      onClick={() => window.history.back()}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3.5 text-sm font-medium text-white/65 transition-all duration-300 hover:border-white/25 hover:bg-white/[0.07] hover:text-white sm:w-auto"
    >
      Go back
    </button>
  );
}
