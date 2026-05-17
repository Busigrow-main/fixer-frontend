"use client";

import { useState } from "react";
import { ACFilterSidebar } from "./ACFilterSidebar";

export function ACFilterDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile Filter Toggle Button — visible only on mobile */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-sm font-semibold text-gray-700 hover:border-[#C8102E] hover:text-[#C8102E] transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-lg">tune</span>
          Filters
        </button>
      </div>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer — slides up from bottom on mobile */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 lg:hidden transition-transform duration-300 ease-in-out ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="bg-white rounded-t-2xl shadow-2xl max-h-[85vh] overflow-y-auto">
          {/* Drawer Handle */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
            <h2 className="text-lg font-bold text-gray-900">Filters</h2>
            <button
              onClick={() => setOpen(false)}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close filters"
            >
              <span className="material-symbols-outlined text-gray-700">close</span>
            </button>
          </div>

          {/* Sidebar Content */}
          <div className="p-4">
            {/* Render sidebar without its outer sticky container */}
            <ACFilterSidebar onApply={() => setOpen(false)} />
          </div>

          {/* Apply Button */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 pb-safe">
            <button
              onClick={() => setOpen(false)}
              className="w-full bg-[#C8102E] hover:bg-[#A00826] text-white font-bold py-3 rounded-lg transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
