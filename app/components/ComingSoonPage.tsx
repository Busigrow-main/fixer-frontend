
import GoBackButton from "./GoBackButton";

export default function ComingSoonPage() {
  return (
    <main className="fixed inset-0 isolate flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-[#07070a] px-5 text-center text-white">
      {/* Subtle red glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600/[0.10] blur-[90px] sm:h-80 sm:w-80"
      />

      <section className="flex w-full max-w-md flex-col items-center">
        {/* Status */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/[0.06] px-4 py-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute h-full w-full animate-ping rounded-full bg-red-500 opacity-60" />
            <span className="relative h-2 w-2 rounded-full bg-red-500" />
          </span>

          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-red-400">
            Coming Soon
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-6xl">
          Something
          <span className="block bg-gradient-to-r from-red-500 to-rose-400 bg-clip-text text-transparent">
            is on the way.
          </span>
        </h1>

        {/* Description */}
        <p className="mt-4 max-w-xs text-sm leading-6 text-white/55 sm:text-base">
          We&apos;re working on something great.
        </p>

        {/* Accent */}
        <div className="mt-7 h-1 w-16 rounded-full bg-red-500/70" />

        {/* Go back */}
        <div className="mt-7">
          <GoBackButton />
        </div>
      </section>
    </main>
  );
}
