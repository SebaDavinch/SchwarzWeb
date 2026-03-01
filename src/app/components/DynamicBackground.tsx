import { useState, useEffect } from "react";

/**
 * Dynamic background that shifts based on real time of day.
 * Night (21-5): Deep dark with neon glow
 * Morning (5-10): Slight warm tint
 * Day (10-17): Slightly lighter with subtle warmth
 * Evening (17-21): Purple/pink sunset tint
 */

interface TimeTheme {
  bg: string;
  glow1: string;
  glow1Color: string;
  glow2: string;
  glow2Color: string;
  overlay: string;
}

function getTimeTheme(): TimeTheme {
  const hour = new Date().getHours();

  if (hour >= 21 || hour < 5) {
    // Night — deep dark, bordeaux/pink accents
    return {
      bg: "#050508",
      glow1: "rgba(155,35,53,0.04)",
      glow1Color: "#9b2335",
      glow2: "rgba(255,51,102,0.03)",
      glow2Color: "#ff3366",
      overlay: "rgba(5,5,8,0)",
    };
  } else if (hour >= 5 && hour < 10) {
    // Morning — slight warm amber tint
    return {
      bg: "#08080d",
      glow1: "rgba(245,158,11,0.03)",
      glow1Color: "#f59e0b",
      glow2: "rgba(155,35,53,0.02)",
      glow2Color: "#9b2335",
      overlay: "rgba(245,158,11,0.01)",
    };
  } else if (hour >= 10 && hour < 17) {
    // Day — slightly brighter, cooler
    return {
      bg: "#0a0a10",
      glow1: "rgba(59,130,246,0.03)",
      glow1Color: "#3b82f6",
      glow2: "rgba(155,35,53,0.02)",
      glow2Color: "#9b2335",
      overlay: "rgba(59,130,246,0.008)",
    };
  } else {
    // Evening — purple/sunset tint
    return {
      bg: "#070710",
      glow1: "rgba(155,35,53,0.04)",
      glow1Color: "#9b2335",
      glow2: "rgba(155,35,53,0.02)",
      glow2Color: "#9b2335",
      overlay: "rgba(145,70,255,0.01)",
    };
  }
}

function getTimePeriod(): string {
  const hour = new Date().getHours();
  if (hour >= 21 || hour < 5) return "night";
  if (hour >= 5 && hour < 10) return "morning";
  if (hour >= 10 && hour < 17) return "day";
  return "evening";
}

export function useDynamicTheme() {
  const [theme, setTheme] = useState<TimeTheme>(getTimeTheme);
  const [period, setPeriod] = useState(getTimePeriod);

  useEffect(() => {
    const interval = setInterval(() => {
      setTheme(getTimeTheme());
      setPeriod(getTimePeriod());
    }, 60000); // update every minute
    return () => clearInterval(interval);
  }, []);

  return { theme, period };
}

export function DynamicBackground() {
  const { theme } = useDynamicTheme();

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 transition-colors duration-[3000ms]"
      style={{ backgroundColor: theme.bg }}
    >
      {/* Ambient glow 1 */}
      <div
        className="absolute top-[20%] left-[15%] w-[500px] h-[500px] rounded-full blur-[250px] transition-all duration-[3000ms]"
        style={{ backgroundColor: theme.glow1Color, opacity: 0.03 }}
      />
      {/* Ambient glow 2 */}
      <div
        className="absolute bottom-[10%] right-[20%] w-[400px] h-[400px] rounded-full blur-[200px] transition-all duration-[3000ms]"
        style={{ backgroundColor: theme.glow2Color, opacity: 0.025 }}
      />
      {/* Subtle overlay */}
      <div
        className="absolute inset-0 transition-colors duration-[3000ms]"
        style={{ backgroundColor: theme.overlay }}
      />
    </div>
  );
}