"use client";

import { MapPin } from "lucide-react";
import SearchBar from "@/app/components/SearchBar";

export default function IndiaMartHero() {
  return (
    <section className="bg-zinc-900 pt-6 pb-14 px-5 md:px-10">
      <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Left Side: Headline */}
        <div className="text-white space-y-4 max-w-xl">
          <h1 className="text-3xl md:text-5xl font-black leading-tight">
            Patna&apos;s Trusted <br />
            <span className="text-primary">Spare Parts</span> Source
          </h1>
          <p className="text-white/80 text-sm md:text-lg font-medium">
            Find genuine OEM and Universal parts for all your home appliances in Patna.
          </p>
        </div>

        {/* Right Side: Search Widget */}
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-3 flex flex-col gap-2">
          {/* Location */}
          <div className="flex items-center gap-2 px-3 py-1.5 border-b border-zinc-100 mb-1">
            <MapPin className="w-4 h-4 text-zinc-400" />
            <span className="text-xs font-bold text-zinc-900">Patna, Bihar</span>
          </div>

          {/* Search Bar */}
          <SearchBar
            variant="hero"
            placeholder="Search — LG Compressor, Motor, Fan etc."
          />

          {/* Submit */}
          <button
            className="w-full h-12 bg-primary text-white font-black rounded-xl uppercase tracking-widest text-sm hover:brightness-110 transition-all mt-1"
            onClick={() => {
              const input = document.querySelector<HTMLInputElement>('input[type=text]');
              if (input?.value) {
                window.location.href = `/spare-parts?q=${encodeURIComponent(input.value)}`;
              }
            }}
          >
            Search
          </button>

          {/* Popular chips */}
          <div className="flex gap-2 flex-wrap pt-1">
            {["AC Filter", "Compressor", "Motor", "Thermostat"].map((tag) => (
              <a
                key={tag}
                href={`/spare-parts?q=${encodeURIComponent(tag)}`}
                className="text-[11px] font-bold text-zinc-500 hover:text-primary bg-zinc-100 hover:bg-primary/5 px-2.5 py-1 rounded-full transition-colors"
              >
                {tag}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
