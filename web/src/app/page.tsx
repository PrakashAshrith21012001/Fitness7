import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { ChatWidget } from "@/components/assistant/ChatWidget";
import { Story } from "@/components/story/Story";
import { Hero } from "@/components/story/Hero";
import { Chapter } from "@/components/story/Chapter";
import { Summit } from "@/components/story/Summit";
import { Meter } from "@/components/story/Meter";
import { Marquee } from "@/components/sections/Marquee";
import { Stats } from "@/components/sections/Stats";
import { Classes } from "@/components/sections/Classes";
import { Trek } from "@/components/sections/Trek";
import { Trainers } from "@/components/sections/Trainers";
import { Process } from "@/components/sections/Process";
import { Facilities } from "@/components/sections/Facilities";
import { Pricing } from "@/components/sections/Pricing";
import { Testimonials } from "@/components/sections/Testimonials";
import { Faq } from "@/components/sections/Faq";
import { Visit } from "@/components/sections/Visit";
import { SiteNotice } from "@/components/sections/SiteNotice";
import { getPublishedTreks, getActiveAnnouncements } from "@/server/treks";

export const revalidate = 60;

export default async function Home() {
  const [{ treks }, notices] = await Promise.all([getPublishedTreks(), getActiveAnnouncements("site")]);
  return (
    <>
      <Nav />
      <SiteNotice notices={notices} />
      <main>
        {/* The climb: ridgelines fall past a pinned camera while the page
            lightens from valley pre-dawn through the cloud layer into sun. */}
        <Story>
          <Hero />
          <Chapter
            number="01"
            band="valley"
            altitude={760}
            eyebrow="Strength"
            title="Build the base everything else stands on."
            accentWord="base"
            side="right"
            media={{ src: "/video/dumbbell-loop", poster: "/video/dumbbell-poster.jpg" }}
            body="Squat, bench, deadlift, press — programmed in four-week blocks so the numbers actually move. Coached technique from the first rep, whether it's your first or your thousandth. This is the part nobody photographs."
            points={["Barbell blocks", "Coach on the bar path", "Numbers you can see"]}
          />
          <Chapter
            number="02"
            band="mist"
            altitude={1160}
            eyebrow="Conditioning"
            title="Then it gets hard to see."
            accentWord="hard"
            side="left"
            body="Short intervals at full effort with strict rest. Kettlebells, sleds, rowers and bodyweight circuits — the hour that decides whether the last climb of a trek is a slog or a walk."
            points={["Intervals with strict rest", "Scaled to who walks in", "Done by 7:40"]}
          />
          <Summit />
          <Meter />
        </Story>

        <Marquee />
        <div className="py-20 sm:py-24">
          <Stats />
        </div>
        <Classes />
        <Trek treks={treks} />
        <Trainers />
        <Process />
        <Facilities />
        <Pricing />
        <Testimonials />
        <Faq />
        <Visit />
      </main>
      <Footer />
      <BackToTop />
      <ChatWidget />
    </>
  );
}
