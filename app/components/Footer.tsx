"use client";

import Link from "next/link";
import { useBooking } from "@/app/context/BookingContext";

const EXPLORE_LINKS = [
  { label: "Services", href: "/services" },
  { label: "Warranty", href: "/warranty" },
  { label: "My Bookings", href: "/my-bookings" },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Warranty Policy", href: "/warranty" },
];

export default function Footer() {
  const { openBooking } = useBooking();

  const handleShare = async () => {
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Fixxer - Professional Appliance Repair",
          text: "Book reliable appliance repair services with Fixxer.",
          url: shareUrl,
        });
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert("Website link copied!");
      } catch {
        alert("Unable to copy the website link.");
      }
    }
  };

  const openGmail = () => {
    const subject = encodeURIComponent(
      "Enquiry - Fixxer Appliance Services"
    );

    const body = encodeURIComponent(
      "Hello Fixxer Team,\n\nI would like to know more about your appliance repair services.\n\nThank you."
    );

    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&to=busigrowindia@gmail.com&su=${subject}&body=${body}`,
      "_blank"
    );
  };

  return (
    <footer className="bg-zinc-50 border-t border-zinc-200 max-md:pb-mobile-footer">
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

              <span className="block mt-2 font-bold text-zinc-900 italic">
                25 Years of Experience
              </span>

              <span className="block mt-1 text-primary font-medium">
                Appliance Insurance Included:
              </span>

              Free service charge for a year & up to 50% off on every spare
              part.
            </p>

            {/* Social Actions */}
            <div className="flex items-center gap-3">

              {/* Share */}
              <button
                type="button"
                onClick={handleShare}
                aria-label="Share Fixxer"
                className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 hover:bg-primary hover:text-white transition-all duration-200"
              >
                <span className="material-symbols-outlined text-base md:text-lg">
                  share
                </span>
              </button>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 hover:bg-primary hover:text-white transition-all duration-200"
              >
                <a
                  href="https://www.instagram.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 hover:bg-primary hover:text-white transition-all duration-200"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="w-[18px] h-[18px] md:w-5 md:h-5 fill-current"
                    aria-hidden="true"
                  >
                    <path d="M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2Zm0 2A3.8 3.8 0 0 0 4 7.8v8.4A3.8 3.8 0 0 0 7.8 20h8.4a3.8 3.8 0 0 0 3.8-3.8V7.8A3.8 3.8 0 0 0 16.2 4H7.8Zm8.65 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
                  </svg>
                </a>
              </a>

              {/* Gmail */}
              <button
                type="button"
                onClick={openGmail}
                aria-label="Email Fixxer"
                className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 hover:bg-primary hover:text-white transition-all duration-200"
              >
                <span className="material-symbols-outlined text-base md:text-lg">
                  mail
                </span>
              </button>

            </div>
          </div>

          {/* Link Clusters */}
          <div className="grid grid-cols-2 gap-6 md:gap-8">

            {/* Explore */}
            <div>
              <h4 className="font-label text-[10px] md:text-xs font-black uppercase tracking-[0.22em] text-zinc-400 mb-4 md:mb-5">
                Explore
              </h4>

              <ul className="space-y-2.5 md:space-y-3">
                {EXPLORE_LINKS.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="font-label text-sm text-zinc-500 hover:text-primary transition-colors duration-200 inline-block"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-label text-[10px] md:text-xs font-black uppercase tracking-[0.22em] text-zinc-400 mb-4 md:mb-5">
                Legal
              </h4>

              <ul className="space-y-2.5 md:space-y-3">
                {LEGAL_LINKS.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="font-label text-sm text-zinc-500 hover:text-primary transition-colors duration-200 inline-block"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Contact Actions */}
          <div id="support">

            <h4 className="font-label text-[10px] md:text-xs font-black uppercase tracking-[0.22em] text-zinc-400 mb-4 md:mb-5">
              Contact Us
            </h4>

            <div className="space-y-4">

              {/* Phone */}
              <div className="flex items-start gap-3 group">
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg md:rounded-xl bg-primary-container flex items-center justify-center flex-shrink-0 group-active:bg-primary transition-colors">
                  <a
                    href="tel:+917004771388"
                    aria-label="Call Cool Air Refrigeration"
                  >
                    <span className="material-symbols-outlined text-primary group-active:text-white text-base md:text-lg icon-filled">
                      call
                    </span>
                  </a>
                </div>

                <div>
                  <p className="font-bold text-zinc-800 text-sm">
                    +91 70047 71388
                  </p>

                  <p className="text-zinc-500 text-[10px] md:text-xs mt-0.5">
                    8 AM - 11 PM Daily
                  </p>
                </div>
              </div>

              {/* WhatsApp */}
              <div className="flex items-start gap-3 group">
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg md:rounded-xl bg-primary-container flex items-center justify-center flex-shrink-0 group-active:bg-primary transition-colors">
                  <a
                    href="https://wa.me/917004771388"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Chat with Cool Air Refrigeration on WhatsApp"
                  >
                    <span className="material-symbols-outlined text-primary group-active:text-white text-base md:text-lg icon-filled">
                      chat
                    </span>
                  </a>
                </div>

                <div>
                  <p className="font-bold text-zinc-800 text-sm">
                    WhatsApp
                  </p>

                  <p className="text-zinc-500 text-[10px] md:text-xs mt-0.5">
                    Chat with us instantly
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-3 group">
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg md:rounded-xl bg-primary-container flex items-center justify-center flex-shrink-0 group-active:bg-primary transition-colors">
                  <a
                    href="https://maps.app.goo.gl/54MmekGpBkcn4yjB8"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Open Cool Air Refrigeration in Google Maps"
                  >
                    <span className="material-symbols-outlined text-primary group-active:text-white text-base md:text-lg icon-filled">
                      location_on
                    </span>
                  </a>
                </div>

                <div>
                  <p className="font-bold text-zinc-800 text-sm">
                    Cool Air Refrigeration
                  </p>

                  <p className="text-zinc-500 text-[10px] md:text-xs mt-0.5">
                    MLA Colony, Raja Bazar, Patna 800014
                  </p>
                </div>
              </div>

              {/* Book a Repair */}
              <button
                type="button"
                onClick={() => openBooking()}
                className="w-full mt-2 bg-primary text-white py-3.5 rounded-xl font-bold text-sm uppercase tracking-wide hover:opacity-90 active:scale-95 transition-all duration-200 shadow-md shadow-primary/10 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base icon-filled">
                  build
                </span>

                Book a Repair
              </button>

            </div>
          </div>

        </div>

        {/* Bottom Credits Bar */}
        <div className="pt-6 md:pt-8 flex flex-col md:flex-row items-center justify-between gap-4">

          <p className="text-zinc-400 font-label text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-center md:text-left">
            © 2026 built by busigrow
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
    </footer>
  );
}