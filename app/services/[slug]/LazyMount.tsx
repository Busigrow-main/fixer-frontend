"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Renders its children only when the placeholder scrolls into view.
 * Stops form effects (autoFocus, scrollIntoView, focus()) from running on page load.
 */
export default function LazyMount({
  children,
  minHeight = 520,
}: {
  children: ReactNode;
  minHeight?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (!("IntersectionObserver" in window)) {
      setShow(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} style={show ? undefined : { minHeight }}>
      {show ? children : null}
    </div>
  );
}