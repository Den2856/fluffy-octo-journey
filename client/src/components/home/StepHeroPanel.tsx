import { useEffect, useMemo, useRef, useState } from "react";

type StepStage = {
  id: string;
  label: string;
  title: string;
  description: string;
  imageSrc: string;
};

type AutoStepsHeroProps = {
  stages: StepStage[];
  intervalMs?: number;
  pauseOnHover?: boolean;
  loop?: boolean;
  className?: string;
};

export default function AutoStepsHero({ stages, intervalMs = 5500, pauseOnHover = true, loop = true, className, }: AutoStepsHeroProps) {

  const count = stages.length;

  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const paused = useMemo(() => {
    if (count <= 1) return true;
    if (!isVisible) return true;
    if (pauseOnHover && hovered) return true;
    return false;
  }, [count, isVisible, pauseOnHover, hovered]);

  const stage = stages[Math.min(Math.max(active, 0), Math.max(0, count - 1))];

  const goTo = (i: number) => setActive(Math.min(Math.max(i, 0), count - 1));

  const next = () => {
    setActive((prev) => {
      const n = prev + 1;
      if (n < count) return n;
      return loop ? 0 : prev;
    });
  };

  return (
    <div ref={rootRef} className={className} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <StepHeroPanel
        steps={stages.map((s) => ({ id: s.id, label: s.label }))}
        activeIndex={active}
        title={stage?.title ?? ""}
        description={stage?.description ?? ""}
        imageSrc={stage?.imageSrc ?? ""}
        cornerNumber={stage?.id ?? ""}
        onStepClick={goTo}
        onAutoAdvance={next}
        intervalMs={intervalMs}
        paused={paused}
        loop={loop}
      />
    </div>
  );
}

type Step = { id: string; label: string };

type StepHeroPanelProps = {
  steps: Step[];
  activeIndex: number;
  title: string;
  description: string;
  imageSrc: string;
  cornerNumber?: string;
  onStepClick?: (index: number) => void;
  onAutoAdvance?: () => void;
  intervalMs?: number;
  paused?: boolean;
  loop?: boolean;
};

function StepHeroPanel({ steps, activeIndex, title, description, imageSrc, cornerNumber, onStepClick, onAutoAdvance, intervalMs = 4500, paused = false, loop = true, }: StepHeroPanelProps) {

  const safeCount = Math.max(1, steps.length);
  const segW = 100 / safeCount;
  const clampedIndex = Math.min(Math.max(activeIndex, 0), safeCount - 1);

  const minRowWidth = safeCount * 170;

  return (
    <section className="w-full bg-black text-white">
      <div className="mx-auto w-full max-w-[1440px] px-6 pt-5">
        <div className="overflow-x-auto pb-2">
          <div style={{ minWidth: `${minRowWidth}px` }}>
            <div className="relative h-[4px] w-full overflow-hidden rounded-[1px]" style={{ ["--seg" as any]: `${100 / safeCount}%` }}>
              <div className="absolute inset-0 bg-white/15" />

              <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: "repeating-linear-gradient(to right, transparent 0, transparent calc(var(--seg) - 1px), black calc(var(--seg) - 1px), black var(--seg))",}} />

              <div className="absolute inset-y-0 left-0 overflow-hidden bg-white/0" style={{ width: `${segW}%`, transform: `translateX(${clampedIndex * 100}%)`}}>
                <div
                  key={clampedIndex}
                  className="h-full w-full origin-left bg-primary"
                  style={{
                    transform: "scaleX(0)",
                    animationName: "stepFill",
                    animationDuration: `${intervalMs}ms`,
                    animationTimingFunction: "linear",
                    animationFillMode: "forwards",
                    animationPlayState: paused ? "paused" : "running",
                    willChange: "transform",
                  }}
                  onAnimationEnd={() => {
                    if (!loop && clampedIndex === safeCount - 1) return;
                    if (!paused) onAutoAdvance?.();
                  }}
                />
              </div>

              <style>
                {`
                  @keyframes stepFill {
                    from { transform: scaleX(0); }
                    to { transform: scaleX(1); }
                  }
                `}
              </style>
            </div>

            <div className="mt-3 grid items-start" style={{ gridTemplateColumns: `repeat(${safeCount}, minmax(0, 1fr))`}}>
              {steps.map((s, i) => {
                const isActive = i === clampedIndex;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onStepClick?.(i)}
                    className={`justify-self-start text-left whitespace-nowrap text-[16px] tracking-wide transition ${ isActive ? "text-white font-semibold" : "text-white/60 hover:text-white/85" }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="relative overflow-hidden border border-white/10">
            <img
              src={imageSrc}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />

            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-black/25" />
            <div className="absolute inset-0 bg-[radial-gradient(120%_100%_at_50%_50%,rgba(0,0,0,0)_0%,rgba(0,0,0,0.55)_55%,rgba(0,0,0,0.85)_100%)]" />

            <div className="relative z-10 min-h-[340px] p-6 sm:min-h-[380px]">
              {cornerNumber ? (
                <div className="absolute right-6 top-6 text-white/75">
                  <span className="text-[25px] font-semibold tracking-wide">
                    {cornerNumber}
                  </span>
                </div>
              ) : null}

              <div className="max-w-[520px]">
                <h2 className="text-[25px] font-semibold leading-tight sm:text-[26px]">
                  {title}
                </h2>

                <div className="mt-48 sm:mt-56">
                  <div className="h-[5px] w-24 bg-primary" />
                  <p className="mt-3 text-[16px] leading-relaxed text-white/75 sm:text-[13px]">
                    {description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
