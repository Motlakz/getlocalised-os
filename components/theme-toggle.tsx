"use client";

import { Moon02Icon, Sun03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";

const listeners = new Set<() => void>();
const subscribe = (fn: () => void) => (listeners.add(fn), () => listeners.delete(fn));
const isDark = () => document.documentElement.classList.contains("dark");

/** Switches between the dark default and light, and remembers the choice. */
export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, isDark, () => true);
  const next = dark ? "light" : "dark";
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      onClick={() => {
        document.documentElement.classList.toggle("dark", next === "dark");
        try {
          localStorage.setItem("theme", next);
        } catch {}
        listeners.forEach((fn) => fn());
      }}
    >
      <HugeiconsIcon icon={dark ? Sun03Icon : Moon02Icon} strokeWidth={1.8} />
    </Button>
  );
}
