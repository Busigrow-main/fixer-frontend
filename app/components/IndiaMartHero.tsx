"use client";

import { Search, MapPin, Camera } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function IndiaMartHero() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/spare-parts?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <section className="bg-zinc-900 pt-6 pb-12 px-5 md:px-10">
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

        {/* Right Side: Search Box */}
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-2 flex flex-col gap-2">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-100">
            <MapPin className="w-4 h-4 text-zinc-400" />
            <span className="text-xs font-bold text-zinc-900">Patna, Bihar</span>
          </div>
          
          <form onSubmit={handleSearch} className="flex items-center bg-zinc-100 rounded-xl px-4 h-14 gap-3">
            <Search className="w-5 h-5 text-zinc-400" />
            <input 
              type="text"
              placeholder="What are you looking for?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-sm font-medium placeholder:text-zinc-400"
            />
            <button type="button" className="text-zinc-400">
              <Camera className="w-5 h-5" />
            </button>
          </form>

          <button 
            type="submit"
            onClick={handleSearch}
            className="w-full h-12 bg-primary text-white font-black rounded-xl uppercase tracking-widest text-sm hover:brightness-110 transition-all"
          >
            Search
          </button>
        </div>
      </div>
    </section>
  );
}
