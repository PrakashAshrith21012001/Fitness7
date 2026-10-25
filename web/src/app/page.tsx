import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { ChatWidget } from "@/components/assistant/ChatWidget";
import { SiteNotice } from "@/components/sections/SiteNotice";
import { HeroCarousel } from "@/components/app/HeroCarousel";
import { QuickActions } from "@/components/app/QuickActions";
import { ClassesBooking } from "@/components/app/ClassesBooking";
import { Discover } from "@/components/app/Discover";
import { Treks } from "@/components/app/Treks";
import { Coaches } from "@/components/app/Coaches";
import { Transform, Questions } from "@/components/app/Transform";
import { Plans } from "@/components/app/Plans";
import { EatWell } from "@/components/app/EatWell";
import { FitEdit, People } from "@/components/app/Community";
import { VisitUs } from "@/components/app/VisitUs";
import { MobileBar } from "@/components/app/MobileBar";
import { getPublishedTreks, getActiveAnnouncements } from "@/server/treks";

export const revalidate = 60;

/** Today's IST calendar day — treks are filtered to upcoming, soonest first (the app's `upcoming`). */
function istToday() {
  return new Date(Date.now() + 5.5 * 3_600_000).toISOString().slice(0, 10);
}

/**
 * The website, built from the app's screens (design v4): Home's hero
 * carousel and quick actions, Fitness → classes with day slots, Discover,
 * the Treks tab, trainers, the Transform tab, F7 pass plans and store strip,
 * nutrition, the video strip, people & testimonials, FAQ, and the centre card.
 * Same photos as the app (web/public/photos ← mobile/assets/photos).
 */
export default async function Home() {
  const [{ treks }, notices] = await Promise.all([getPublishedTreks(), getActiveAnnouncements("site")]);
  const todayIst = istToday();
  const upcoming = treks.filter((t) => t.date >= todayIst).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <>
      <Nav />
      <main>
        <HeroCarousel />
        <SiteNotice notices={notices} />
        <QuickActions />
        <ClassesBooking />
        <Discover />
        <Treks treks={upcoming.length ? upcoming : treks} />
        <Coaches />
        <Transform />
        <Plans />
        <EatWell />
        <FitEdit />
        <People />
        <Questions />
        <VisitUs />
      </main>
      <Footer />
      <MobileBar />
      <BackToTop />
      <ChatWidget />
    </>
  );
}
