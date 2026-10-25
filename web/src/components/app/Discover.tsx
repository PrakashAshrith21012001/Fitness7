import { ChevronRight } from "lucide-react";
import { discover } from "@f7/content";
import { photo, routeToAnchor } from "@/lib/photos";
import { Block, Photo, Scrim, SectionHead, Wrap } from "@/components/app/ui";

/** Home → "Discover more": the 2-up photo tiles, four across on desktop. */
export function Discover() {
  return (
    <Block>
      <Wrap>
        <SectionHead title="Discover more" center />
        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {discover.map((d) => (
            <li key={d.id}>
              <a href={routeToAnchor(d.route)} className="group relative block h-[200px] overflow-hidden rounded-[14px] bg-surface-2 text-[#fff] sm:h-[260px]">
                <Photo src={photo(d.photo)} alt="" sizes="(min-width: 1024px) 300px, 50vw" className="transition-transform duration-700 group-hover:scale-[1.04]" />
                <Scrim />
                <div className="absolute inset-x-3 bottom-3">
                  <span className="mb-2 grid size-6 place-items-center rounded-full border border-[rgba(255,255,255,0.7)]">
                    <ChevronRight className="size-3" strokeWidth={2.4} />
                  </span>
                  <p className="line-clamp-2 text-[15px] font-semibold leading-5">{d.title}</p>
                  <p className="mt-0.5 truncate text-[13px] text-[rgba(255,255,255,0.7)]">{d.sub}</p>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </Wrap>
    </Block>
  );
}
