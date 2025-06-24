"use client";
import { ThemeProvider } from "@/components/theme-provider";
import { useEffect } from "react";

// app/theses/layout.tsx
export default function Layout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let lastTouchEnd = 0;

    const preventDoubleTapZoom = (e: TouchEvent) => {
      const now = new Date().getTime();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };

    const preventPinchZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    document.addEventListener("touchend", preventDoubleTapZoom, false);
    document.addEventListener("touchmove", preventPinchZoom, {
      passive: false,
    });

    return () => {
      document.removeEventListener("touchend", preventDoubleTapZoom);
      document.removeEventListener("touchmove", preventPinchZoom);
    };
  }, []);
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      forcedTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
