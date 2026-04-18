"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

// ── Image overrides ──────────────────────────────────────────────
// Drop your images into /public/images/ and set the paths below.
// When a path is set, it replaces the solid colour for that element.
// Leave empty ("") to keep using solid colours.
const TRACK_LIGHT_IMAGE = ""; // e.g. "/images/toggle-track-light.png"
const TRACK_DARK_IMAGE = "";  // e.g. "/images/toggle-track-dark.png"
const KNOB_LIGHT_IMAGE = "";  // e.g. "/images/toggle-knob-light.png"
const KNOB_DARK_IMAGE = "";   // e.g. "/images/toggle-knob-dark.png"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (!mounted) {
    return (
      <div className="flex flex-col items-center gap-1.5">
        <div className="w-16 h-8 rounded-full bg-muted" />
        <span className="text-[10px] font-semibold tracking-widest text-muted-foreground">
          &nbsp;
        </span>
      </div>
    );
  }

  const isDark = theme === "dark";

  const trackImage = isDark ? TRACK_DARK_IMAGE : TRACK_LIGHT_IMAGE;
  const knobImage = isDark ? KNOB_DARK_IMAGE : KNOB_LIGHT_IMAGE;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <button
        onClick={() => setTheme(isDark ? "light" : "dark")}
        role="switch"
        aria-checked={isDark}
        aria-label="Toggle dark mode"
        className={cn(
          "relative w-16 h-8 rounded-full transition-colors duration-500",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "bg-cover bg-center",
          !trackImage && (isDark ? "bg-slate-800" : "bg-sky-400")
        )}
        style={trackImage ? { backgroundImage: `url(${trackImage})` } : undefined}
      >
        {/* Knob */}
        <div
          className={cn(
            "absolute top-1 left-1 w-6 h-6 rounded-full transition-all duration-500",
            "bg-cover bg-center",
            !knobImage &&
              (isDark
                ? "translate-x-8 bg-slate-300"
                : "translate-x-0 bg-amber-400")
          )}
          style={knobImage ? { backgroundImage: `url(${knobImage})` } : undefined}
        />
      </button>

      <span
        className={cn(
          "text-[10px] font-semibold tracking-widest uppercase transition-colors duration-500",
          isDark ? "text-slate-400" : "text-sky-600"
        )}
      >
        {isDark ? "Dark" : "Light"}
      </span>
    </div>
  );
}
