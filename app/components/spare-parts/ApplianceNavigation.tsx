"use client";

import React from 'react';
import { cn } from '@/app/lib/utils';
import { getApplianceIcon } from './IconMap';

interface ApplianceTypeSidebarProps {
  items: any[];
  activeSlug: string;
  onSelect: (slug: string) => void;
}

export const ApplianceTypeSidebar: React.FC<ApplianceTypeSidebarProps> = ({
  items,
  activeSlug,
  onSelect,
}) => {
  return (
    <aside className="hidden md:flex flex-col w-24 lg:w-32 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto border-r border-zinc-100 bg-zinc-50/50">
      <div className="flex flex-col py-4">
        {items.map((item) => {
          const isActive = activeSlug === item.applianceTypeSlug;
          return (
            <button
              key={item.applianceTypeSlug}
              onClick={() => onSelect(item.applianceTypeSlug)}
              className={cn(
                "group relative flex flex-col items-center justify-center py-5 px-2 transition-all duration-300",
                isActive 
                  ? "bg-white text-primary" 
                  : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
              )}
              <div className={cn(
                "p-2 rounded-xl transition-all duration-300",
                isActive ? "bg-primary/10 text-primary" : "text-zinc-400 group-hover:text-zinc-600"
              )}>
                {getApplianceIcon(item.applianceTypeIcon, "w-6 h-6")}
              </div>
              <span className={cn(
                "text-[10px] lg:text-xs font-bold mt-2 text-center leading-tight",
                isActive ? "text-primary" : "text-zinc-500"
              )}>
                {item.applianceTypeName}
              </span>
              {item.totalPartsCount > 0 && (
                 <span className="absolute top-2 right-2 text-[8px] bg-zinc-200 text-zinc-600 px-1 rounded-full font-black">
                    {item.totalPartsCount}
                 </span>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export const ApplianceTabRail: React.FC<ApplianceTypeSidebarProps> = ({
  items,
  activeSlug,
  onSelect,
}) => {
  return (
    <div className="md:hidden sticky top-14 z-30 bg-white border-b border-zinc-100 overflow-x-auto no-scrollbar">
      <div className="flex px-4 py-3 gap-2 min-w-max">
        {items.map((item) => {
          const isActive = activeSlug === item.applianceTypeSlug;
          return (
            <button
              key={item.applianceTypeSlug}
              onClick={() => onSelect(item.applianceTypeSlug)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300",
                isActive 
                  ? "bg-primary/10 text-primary ring-1 ring-primary/20" 
                  : "bg-zinc-50 text-zinc-500 hover:bg-zinc-100"
              )}
            >
              {getApplianceIcon(item.applianceTypeIcon, "w-4 h-4")}
              <span className="text-xs font-bold whitespace-nowrap">
                {item.applianceTypeName}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
