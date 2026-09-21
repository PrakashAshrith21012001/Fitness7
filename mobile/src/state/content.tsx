import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { treks as staticTreks, upcomingTreks as staticUpcoming, type AnnouncementRow, type Trek } from "@f7/content";
import { API_URL, apiConfigured } from "@/lib/api";

/**
 * Content the owner posts from /admin — treks and announcements. Cached on
 * the phone, refreshed in the background on open and on foreground (at most
 * every five minutes), and the built-in list from shared/gym.ts when nothing
 * has been posted or the site can't be reached. Never a spinner.
 */

type Ctx = {
  treks: Trek[];
  upcoming: Trek[];
  next: Trek | undefined;
  byId: (id: string) => Trek | undefined;
  announcements: AnnouncementRow[];
  source: "db" | "static";
};

const KEY = "f7-content";
const MIN_GAP = 5 * 60_000;
const ContentCtx = createContext<Ctx | null>(null);

const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export function ContentProvider({ children }: { children: ReactNode }) {
  const [treks, setTreks] = useState<Trek[]>(staticTreks);
  const [source, setSource] = useState<"db" | "static">("static");
  const [announcements, setAnnouncements] = useState<AnnouncementRow[]>([]);
  const last = useRef(0);

  const refresh = useCallback(async () => {
    if (!apiConfigured || Date.now() - last.current < MIN_GAP) return;
    last.current = Date.now();
    try {
      const [t, a] = await Promise.all([
        fetch(`${API_URL}/api/treks`, { signal: AbortSignal.timeout(8000) }).then((r) => (r.ok ? r.json() : null)),
        fetch(`${API_URL}/api/announcements?audience=app`, { signal: AbortSignal.timeout(8000) }).then((r) => (r.ok ? r.json() : null)),
      ]);
      const next = {
        treks: (t?.treks as Trek[] | undefined) ?? staticTreks,
        source: (t?.source as "db" | "static" | undefined) ?? "static",
        announcements: (a?.announcements as AnnouncementRow[] | undefined) ?? [],
      };
      setTreks(next.treks);
      setSource(next.source);
      setAnnouncements(next.announcements);
      await AsyncStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* offline — cache stands */
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const v = await AsyncStorage.getItem(KEY);
        if (v) {
          const c = JSON.parse(v) as { treks: Trek[]; source: "db" | "static"; announcements: AnnouncementRow[] };
          if (c.treks?.length) {
            setTreks(c.treks);
            setSource(c.source);
          }
          setAnnouncements(c.announcements ?? []);
        }
      } catch {
        /* no cache */
      }
      void refresh();
    })();
    const sub = AppState.addEventListener("change", (s) => {
      if (s === "active") void refresh();
    });
    return () => sub.remove();
  }, [refresh]);

  const value = useMemo<Ctx>(() => {
    const today = todayIso();
    const upcoming = source === "db" ? [...treks].filter((t) => t.date >= today).sort((a, b) => a.date.localeCompare(b.date)) : staticUpcoming();
    const active = announcements.filter((a) => a.starts_on <= today && a.ends_on >= today);
    return { treks, upcoming, next: upcoming[0], byId: (id) => treks.find((t) => t.id === id) ?? staticTreks.find((t) => t.id === id), announcements: active, source };
  }, [treks, announcements, source]);

  return <ContentCtx.Provider value={value}>{children}</ContentCtx.Provider>;
}

export function useContent() {
  const ctx = useContext(ContentCtx);
  if (!ctx) throw new Error("useContent outside ContentProvider");
  return ctx;
}
