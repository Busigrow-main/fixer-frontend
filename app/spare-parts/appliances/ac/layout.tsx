import { ReactNode } from "react";

import { Suspense } from "react";

export default function ACLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      {children}
    </Suspense>
  );
}
