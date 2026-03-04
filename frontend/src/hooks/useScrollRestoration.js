"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function useScrollRestoration(ready) {
  const pathname = usePathname();
  const restoredRef = useRef(false);

  useEffect(() => {
    if (!pathname) return;

    const storageKey = `scroll-${pathname}`;

    // ✅ restore ONLY when data is ready
    if (ready && !restoredRef.current) {
        console.log("restoring...")
      const saved = sessionStorage.getItem(storageKey);

      if (saved) {
        const { x, y } = JSON.parse(saved);

        requestAnimationFrame(() => {
          window.scrollTo(x, y);
        });

        console.log("restored position...", x , y)
      }

      restoredRef.current = true;
      console.log("restored scroll")
    }

    // ✅ save scroll when leaving
    const saveScroll = () => {
        console.log("saving position...")
      sessionStorage.setItem(
        storageKey,
        JSON.stringify({
          x: window.scrollX,
          y: window.scrollY,
        })
      );

        console.log("saved position..." , window.scrollX, window.scrollY)
    };

    return () => saveScroll();
  }, [pathname, ready]);
}