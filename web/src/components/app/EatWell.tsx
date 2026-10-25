import { Camera, Droplet, Flame, Play, Search, Utensils } from "lucide-react";
import { brand, fitWay, recipeHero, recipes, wa } from "@f7/content";
import { photo } from "@/lib/photos";
import { Block, Photo, Scrim, SectionHead, Wrap } from "@/components/app/ui";

/**
 * Nutrition, the app's way: the calorie tracker's Today ring (what members
 * get in the app), "The F7 Way" articles and the One Pot recipe row.
 */

function TodayRing() {
  // A still of the app's Today tile — eaten / burned / water rings.
  const r = [54, 42, 30];
  const pct = [0.68, 0.45, 0.75];
  const tone = ["var(--color-green)", "var(--color-pink)", "var(--color-blue)"];
  return (
    <svg viewBox="0 0 140 140" className="size-36 shrink-0 -rotate-90" aria-hidden>
      {r.map((rad, i) => {
        const c = 2 * Math.PI * rad;
        return (
          <g key={rad}>
            <circle cx="70" cy="70" r={rad} fill="none" stroke="var(--color-surface-2)" strokeWidth="9" />
            <circle cx="70" cy="70" r={rad} fill="none" stroke={tone[i]} strokeWidth="9" strokeLinecap="round" strokeDasharray={`${c * pct[i]} ${c}`} />
          </g>
        );
      })}
    </svg>
  );
}

export function EatWell() {
  return (
    <Block id="eat-well">
      <Wrap>
        <SectionHead title="Eat well" sub="Training is half of it. The other half is on your plate." />

        <div className="grid gap-4 lg:grid-cols-2">
          {/* ---------- calorie tracker ---------- */}
          <div className="pane flex flex-col p-5 sm:p-6">
            <p className="label !text-green">In the {brand.name} app</p>
            <h3 className="mt-1.5 text-2xl font-extrabold leading-tight text-white">Track every plate. Indian food, real portions.</h3>
            <div className="mt-5 flex items-center gap-5">
              <TodayRing />
              <ul className="space-y-2.5 text-sm">
                <li className="flex items-center gap-2.5">
                  <Utensils className="size-4 text-green" strokeWidth={2} />
                  <span className="text-white"><b>1,240</b> <span className="text-muted">of 1,800 kcal eaten</span></span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Flame className="size-4 text-pink" strokeWidth={2} />
                  <span className="text-white"><b>410</b> <span className="text-muted">kcal burned</span></span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Droplet className="size-4 text-blue" strokeWidth={2} />
                  <span className="text-white"><b>6</b> <span className="text-muted">of 8 glasses</span></span>
                </li>
              </ul>
            </div>
            <ul className="mt-6 grid grid-cols-3 gap-2 text-center text-[11px] text-muted sm:text-xs">
              <li className="rounded-lg bg-surface p-2.5"><Search className="mx-auto mb-1 size-4 text-white" strokeWidth={1.8} />Search idli to biryani</li>
              <li className="rounded-lg bg-surface p-2.5"><Camera className="mx-auto mb-1 size-4 text-white" strokeWidth={1.8} />Snap a plate</li>
              <li className="rounded-lg bg-surface p-2.5"><Droplet className="mx-auto mb-1 size-4 text-white" strokeWidth={1.8} />Water & steps</li>
            </ul>
            <p className="mt-5 text-[13px] text-muted">The app is coming to Google Play — ask at the desk for early access.</p>
            <a href={wa.general()} target="_blank" rel="noopener noreferrer" className="btn-pink mt-4 inline-flex h-11 items-center justify-center self-start px-5">
              Get early access
            </a>
          </div>

          {/* ---------- One Pot ---------- */}
          <div className="flex flex-col">
            <a href={wa.general()} target="_blank" rel="noopener noreferrer" className="relative block h-[240px] overflow-hidden rounded-[14px] bg-surface-2 text-[#fff] sm:h-[280px]">
              <Photo src={photo("recipe-one-pot")} alt="" sizes="(min-width: 1024px) 600px, 100vw" />
              <Scrim />
              <div className="absolute inset-x-0 bottom-4 flex flex-col items-center text-center">
                <p className="label !text-[rgba(255,255,255,0.75)]">{recipeHero.title}</p>
                <p className="mt-1 text-xl font-semibold italic">{recipeHero.sub}</p>
              </div>
            </a>
            <ul className="mt-2">
              {recipes.map((r) => (
                <li key={r.id} className="flex items-center gap-3.5 py-2.5">
                  <span className="relative size-14 shrink-0 overflow-hidden rounded-[10px] bg-surface-2">
                    <Photo src={photo(r.photo)} alt="" sizes="56px" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[15px] font-semibold text-white">{r.title}</span>
                    <span className="mt-1 flex items-center gap-1.5 text-[13px] text-muted">
                      <Play className="size-2.5 fill-current" strokeWidth={0} /> {r.kcal} calories
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ---------- The F7 Way ---------- */}
        <h3 className="mb-4 mt-10 text-xl font-extrabold text-white sm:text-2xl">The F7 Way</h3>
        <ul className="grid gap-3 sm:grid-cols-2 lg:gap-4">
          {fitWay.map((a) => (
            <li key={a.id} className="relative h-[260px] overflow-hidden rounded-[14px] bg-surface-2 text-[#fff] sm:h-[320px]">
              <Photo src={photo(a.photo)} alt="" sizes="(min-width: 640px) 50vw, 100vw" />
              <Scrim />
              <div className="absolute inset-x-4 bottom-5 flex flex-col items-center text-center">
                <p className="text-[22px] font-black uppercase tracking-[0.03em]">{a.title}</p>
                <p className="mt-1 text-[13px] text-[rgba(255,255,255,0.75)]">{a.sub}</p>
              </div>
            </li>
          ))}
        </ul>
      </Wrap>
    </Block>
  );
}
