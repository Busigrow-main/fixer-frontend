"use client";

import { useState } from "react";

interface Section {
  id: string;
  title: string;
  icon: string;
  children: React.ReactNode;
}

export function ACDetailAccordion({ sections }: { sections: Section[] }) {
  const [openId, setOpenId] = useState<string | null>(sections[0]?.id ?? null);

  return (
    <div className="bg-white divide-y divide-gray-100 border-y border-gray-100">
      {sections.map((section) => {
        const isOpen = openId === section.id;
        return (
          <div key={section.id}>
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : section.id)}
              className="w-full flex items-center justify-between px-4 py-3.5 text-left active:bg-gray-50"
            >
              <span className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#C8102E] text-xl">{section.icon}</span>
                <span className="font-bold text-sm text-gray-900">{section.title}</span>
              </span>
              <span
                className={`material-symbols-outlined text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              >
                expand_more
              </span>
            </button>
            {isOpen && <div className="px-4 pb-4">{section.children}</div>}
          </div>
        );
      })}
    </div>
  );
}
