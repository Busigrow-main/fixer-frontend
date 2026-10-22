
"use client";

type Props = {
  title?: string;
  location: string;
  onBack: () => void;
  onLocationClick?: () => void;
};

export default function SpareHeader({
  title = "Spare Parts",
  location,
  onBack,
  onLocationClick,
}: Props) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-[52px] w-full items-center gap-2 border-b border-[#E8E8EB] bg-white px-3 sm:h-14 sm:px-5 md:hidden">
      {/* Back button */}
      <button
        type="button"
        aria-label="Go back"
        onClick={onBack}
        className="-ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#292929] transition-colors hover:bg-[#F5F5F6] active:scale-95"
      >
        <span className="material-symbols-outlined text-[22px]">
          arrow_back
        </span>
      </button>

      {/* Page title */}
      <h1 className="min-w-0 flex-1 truncate text-[15px] font-semibold tracking-[-0.2px] text-[#242424] sm:text-base">
        {title}
      </h1>

      {/* Location selector */}
      <button
        type="button"
        onClick={onLocationClick}
        aria-label={`Delivery location: ${location}. Tap to change`}
        className="inline-flex h-[30px] max-w-[48%] shrink-0 items-center gap-1 rounded-full border border-[#E7E7EA] bg-[#F7F7F8] px-2 text-[10px] font-medium text-[#55565B] transition-colors hover:bg-[#F0F0F2] active:scale-[0.98] sm:h-8 sm:gap-1.5 sm:px-2.5 sm:text-xs"
      >
        <span className="material-symbols-outlined icon-filled text-[13px] text-[#D8102B] sm:text-[15px]">
          location_on
        </span>

        <span className="truncate">{location}</span>

        <span className="material-symbols-outlined shrink-0 text-[13px] text-[#77787D]">
          expand_more
        </span>
      </button>
    </header>
  );
}
