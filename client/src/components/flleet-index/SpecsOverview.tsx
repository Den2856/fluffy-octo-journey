import { useMemo } from "react";
import { Gauge, GitBranch, Settings2, Cog } from "lucide-react";
import AutoMiniCarousel from "./AutoCarousel";

type Slide = { url: string; alt?: string };

type Car = {
  make: string;
  model: string;
  specs?: {
    acceleration0to100Sec?: number;
    drivetrain?: string;
    transmissionDetail?: string;
    engine?: string;
  };
  overviewBlocks?: { title?: string; text: string }[];
};

function fmtSeconds(v?: number) {
  if (typeof v !== "number") return "—";
  return `${v.toFixed(1)} seconds`;
}

export default function SpecsOverview({ car, slides, }: { car: Car; slides: Slide[];  }) {
  
  const specItems = useMemo(() => {
    const s = car.specs;

    return [
      {
        key: "0-100",
        label: "0-100 kmh",
        value: fmtSeconds(s?.acceleration0to100Sec),
        Icon: Gauge,
      },
      {
        key: "drivetrain",
        label: "Drivetrain",
        value: s?.drivetrain ?? "—",
        Icon: GitBranch,
      },
      {
        key: "transmission",
        label: "Transmission",
        value: s?.transmissionDetail ?? "—",
        Icon: Settings2,
      },
      {
        key: "engine",
        label: "Engine",
        value: s?.engine ?? "—",
        Icon: Cog,
      },
    ];
  }, [car.specs]);

  const overview = useMemo(() => {
    const blocks = car.overviewBlocks ?? [];

    return blocks.map((b, i) => {
      const t = (b.title ?? "").trim();
      const isIntro = i === 0 && t.toLowerCase() === "overview";
      return {
        title: isIntro ? "" : t,
        text: b.text,
      };
    });
  }, [car.overviewBlocks]);

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 items-start gap-10 sm:gap-12 lg:gap-16">
      <div className="lg:col-span-5 xl:col-span-6">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
          Specifications
        </h2>

        <div className="mt-6 sm:mt-10 grid grid-cols-1 sm:grid-cols-2 gap-[30px]">
          {specItems.map((s) => (
            <div key={s.key} className="flex gap-3">
              <s.Icon className="mt-1 h-4 w-4 sm:h-5 sm:w-5 text-primary" />

              <div>
                <div className="text-[16px] sm:text-[20px] font-medium text-white">
                  {s.label}
                </div>
                <div className="mt-2 text-base text-white/65">
                  {s.value}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 sm:mt-14">
          <AutoMiniCarousel slides={slides} intervalMs={2600} />
        </div>
      </div>

      <div className="lg:col-span-7 xl:col-span-6">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
          Overview
        </h2>

        <div className="mt-6 sm:mt-10 space-y-10 sm:space-y-12 lg:space-y-14">
          {overview.map((b, idx) => (
            <div key={idx}>
              {b.title ? (
                <h3 className="text-xl sm:text-2xl font-semibold text-white">
                  {b.title}
                </h3>
              ) : null}

              <p className="mt-3 sm:mt-4 text-base sm:text-[15px] leading-7 text-white/65">
                {b.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
