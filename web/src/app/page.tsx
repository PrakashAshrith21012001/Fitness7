import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ChatWidget } from "@/components/assistant/ChatWidget";
import { SiteNotice } from "@/components/sections/SiteNotice";
import { MobileBar } from "@/components/app/MobileBar";
import { Toaster } from "@/components/site/Toaster";
import { SmoothScroll } from "@/components/home/SmoothScroll";
import { Hero } from "@/components/home/Hero";
import { Marquee } from "@/components/home/Marquee";
import { Programs } from "@/components/home/Programs";
import { Timetable } from "@/components/home/Timetable";
import { Treks } from "@/components/home/Treks";
import { Numbers } from "@/components/home/Numbers";
import { Coaching } from "@/components/home/Coaching";
import { Plans } from "@/components/home/Plans";
import { Voices, Questions } from "@/components/home/Voices";
import { VisitUs } from "@/components/home/VisitUs";
import { Closing } from "@/components/home/Closing";
import { getPublishedTreks, getActiveAnnouncements } from "@/server/treks";

export const revalidate = 60;

/** Today's IST calendar day — treks are filtered to upcoming, soonest first. */
function istToday() {
  return new Date(Date.now() + 5.5 * 3_600_000).toISOString().slice(0, 10);
}

/**
 * v20 — light, editorial, motion-led. The page answers a visitor in the
 * order they ask: what is this (hero) → what do you train → when → what's
 * special (treks) → proof → who coaches → cost → what members say →
 * questions → where → book. One primary action throughout: a free session.
 * Fixed UI (nav, phone bar, chat, toasts) sits outside the smooth scroller.
 */
export default async function Home() {
  const [{ treks }, notices] = await Promise.all([getPublishedTreks(), getActiveAnnouncements("site")]);
  const today = istToday();
  const upcoming = treks.filter((t) => t.date >= today).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <>
      <Nav />
      <SmoothScroll>
        <main>
          <Hero />
          <SiteNotice notices={notices} />
          <Marquee />
          <Programs />
          <Timetable />
          <Treks treks={upcoming.length ? upcoming : treks} />
          <Numbers />
          <Coaching />
          <Plans />
          <Voices />
          <Questions />
          <VisitUs />
          <Closing />
        </main>
        <Footer />
      </SmoothScroll>
      <MobileBar />
      <ChatWidget />
      <Toaster />
    </>
  );
}
