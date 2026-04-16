import Link from "next/link";

const EXPLORE_LINKS = ["Local Expertise", "Service Areas", "OEM Catalog"];
const LEGAL_LINKS = ["Privacy Policy", "Terms of Service"];

export default function Footer() {
  return (
    <footer className="bg-zinc-50 border-t border-zinc-200">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-10 pt-8 md:pt-12 pb-6 md:pb-8">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 pb-10 md:pb-12 border-b border-zinc-200/70">
          
          {/* Brand & Description */}
          <div className="space-y-4 md:space-y-5">
            <Link
              href="/"
              className="text-2xl font-black tracking-tighter text-zinc-900 select-none"
            >
              Fixx<span className="text-primary">er</span>
            </Link>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-xs opacity-90 text-balance">
              Professional grade technical mastery for the modern home.
              <span className="block mt-2 font-bold text-zinc-900 italic">25 Years of Experience</span>
              <span className="block mt-1 text-primary font-medium">Appliance Insurance Included:</span>
              Free service charge for a year & up to 50% off on every spare part.
            </p>

            {/* Social buttons */}
            <div className="flex gap-3">
              {[
                { icon: "share", label: "Share" },
                { icon: "thumb_up", label: "Like" },
                { icon: "mail", label: "Email" },
              ].map(({ icon, label }) => (
                <button
                  key={label}
                  aria-label={label}
                  className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 hover:bg-primary hover:text-white transition-all duration-200"
                >
                  <span className="material-symbols-outlined text-base md:text-lg">{icon}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Link Clusters: 2 columns on mobile for tight layout */}
          <div className="grid grid-cols-2 gap-6 md:gap-8">
            <div>
              <h4 className="font-label text-[10px] md:text-xs font-black uppercase tracking-[0.22em] text-zinc-400 mb-4 md:mb-5">
                Explore
              </h4>
              <ul className="space-y-2.5 md:space-y-3">
                {EXPLORE_LINKS.map((item) => (
                  <li key={item}>
                    <Link
                      href="#"
                      className="font-label text-sm text-zinc-500 hover:text-primary transition-colors duration-200 inline-block"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-label text-[10px] md:text-xs font-black uppercase tracking-[0.22em] text-zinc-400 mb-4 md:mb-5">
                Legal
              </h4>
              <ul className="space-y-2.5 md:space-y-3">
                {LEGAL_LINKS.map((item) => (
                  <li key={item}>
                    <Link
                      href="#"
                      className="font-label text-sm text-zinc-500 hover:text-primary transition-colors duration-200 inline-block"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact Actions (Fixed for mobile) */}
          <div id="support">
            <h4 className="font-label text-[10px] md:text-xs font-black uppercase tracking-[0.22em] text-zinc-400 mb-4 md:mb-5">
              Contact Us
            </h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3 group">
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg md:rounded-xl bg-primary-container flex items-center justify-center flex-shrink-0 group-active:bg-primary transition-colors">
                  <span className="material-symbols-outlined text-primary group-active:text-white text-base md:text-lg icon-filled">
                    call
                  </span>
                </div>
                <div>
                  <p className="font-bold text-zinc-800 text-sm">1-800-FIXXER-PRO</p>
                  <p className="text-zinc-500 text-[10px] md:text-xs mt-0.5">24/7 Dispatch</p>
                </div>
              </div>

              <div className="flex items-start gap-3 group">
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg md:rounded-xl bg-primary-container flex items-center justify-center flex-shrink-0 group-active:bg-primary transition-colors">
                  <span className="material-symbols-outlined text-primary group-active:text-white text-base md:text-lg icon-filled">
                    location_on
                  </span>
                </div>
                <div>
                  <p className="font-bold text-zinc-800 text-sm">Downtown Hub</p>
                  <p className="text-zinc-500 text-[10px] md:text-xs mt-0.5">422 Artisan Way</p>
                </div>
              </div>

              {/* Mobile CTA: Large, accessible button */}
              <button className="w-full mt-2 bg-primary text-white py-3.5 rounded-xl font-bold text-sm uppercase tracking-wide hover:opacity-90 active:scale-95 transition-all duration-200 shadow-md shadow-primary/10 flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-base icon-filled">build</span>
                Book a Repair
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Credits Bar */}
        <div className="pt-6 md:pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-zinc-400 font-label text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-center md:text-left">
            © 2024 Fixxer Technical Mastery. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-zinc-400">
            <span className="material-symbols-outlined text-sm md:text-base text-primary icon-filled">
              favorite
            </span>
            <span className="text-[9px] md:text-[10px] uppercase tracking-wider font-bold">
              Made for your neighborhood
            </span>
          </div>
        </div>
      </div>
    </footer >
  );
}
