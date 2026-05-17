"use client";

export function ACFeatureList({ features }: { features: string[] }) {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
      {features.map((f, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
          <span className="material-symbols-outlined text-base icon-filled text-[#C8102E] flex-shrink-0 mt-0.5">check_circle</span>
          {f}
        </li>
      ))}
    </ul>
  );
}
