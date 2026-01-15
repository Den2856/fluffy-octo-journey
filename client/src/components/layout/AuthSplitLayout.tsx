import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

type Slide = {
  image?: string;
  headline: string;
  sub: string;
};

type Props = {
  title: string;
  subtitle: React.ReactNode;
  children: React.ReactNode;
  backTo?: string;
  brand?: React.ReactNode;
  slides?: Slide[];
};

const COLORS = {
  bg: "#010101",
  dark100: "#141414",
  dark200: "#0a0a0a",
  primary: "#b81d1d",
};

export default function AuthSplitLayout({ title, subtitle, children, backTo = "/", brand, slides, }: Props) {

  const defaultSlides: Slide[] = useMemo(
    () => [
      { image: "https://fluffy-octo-journey-k27p.onrender.com/api/v1//cars/range-rover-sport-p400/1.png", headline: "Luxury rides,", sub: "Seamless experience" },
      { image: "https://fluffy-octo-journey-k27p.onrender.com/api/v1//cars/mercedes-e-300/1.png", headline: "Premium fleet,", sub: "Ready on demand" },
      { image: "https://fluffy-octo-journey-k27p.onrender.com/api/v1//cars/mclaren-720s/1.png", headline: "Elite service,", sub: "24/7 support" },
    ],
    []
  );

  const S = slides?.length ? slides : defaultSlides;

  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setIdx((v) => (v + 1) % S.length);
    }, 5000);
    return () => clearInterval(t);
  }, [S.length]);

  const active = S[idx];

  return (
    <div className="min-h-screen grid place-items-center px-4 py-10">
      <div className="w-full max-w-6xl rounded-[28px] border border-white/10 shadow-2xl overflow-hidden" style={{ background: `linear-gradient(180deg, rgba(255,255,255,.03), rgba(255,255,255,.01))`}}>
        <div className="grid lg:grid-cols-[1.05fr_.95fr]">

          <div className="relative p-3 lg:p-4">
            <div className="relative h-[520px] lg:h-[640px] rounded-[24px] overflow-hidden border border-white/10" style={{ backgroundColor: COLORS.dark200 }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={idx}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.01 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  style={{
                    backgroundImage: active.image
                      ? `linear-gradient(180deg, rgba(0,0,0,.15), rgba(0,0,0,.55)), url(${active.image})`
                      : `radial-gradient(900px 500px at 30% 20%, rgba(184,29,29,.25), transparent 60%),
                         radial-gradient(700px 500px at 70% 60%, rgba(255,255,255,.08), transparent 60%),
                         ${COLORS.dark200}`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
              </AnimatePresence>

              <div className="absolute left-0 right-0 top-0 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {brand ?? (
                    <div className="flex items-center gap-2">
                      <p className="text-xl text-white font-semibold leading-[1.1rem] tracking-[-0.09em] translate-y-0">opu—rent</p>
                    </div>
                  )}
                </div>

                <Link
                  to={backTo}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/80 hover:bg-white/10"
                >
                  Back to website <span aria-hidden><ArrowRight size={12} className="text-primary" /></span>
                </Link>
              </div>

              <div className="absolute left-0 right-0 bottom-0 p-6">
                <div className="max-w-[360px]">
                  <div className="text-3xl lg:text-4xl font-semibold text-white leading-tight">
                    {active.headline}
                    <br />
                    {active.sub}
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-3">
                  {S.map((_, i) => {
                    const on = i === idx;
                    return (
                      <button
                        key={i}
                        onClick={() => setIdx(i)}
                        className="h-2 rounded-full transition"
                        style={{
                          width: on ? 38 : 18,
                          background: on ? "rgba(255,255,255,.75)" : "rgba(255,255,255,.25)",
                        }}
                        aria-label={`Slide ${i + 1}`}
                      />
                    );
                  })}
                </div>
              </div>


              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  boxShadow: `inset 0 0 0 1px rgba(255,255,255,.06),
                              inset 0 0 120px rgba(184,29,29,.10)`,
                }}
              />
            </div>
          </div>

          <div className="p-6 lg:p-10">
            <h1 className="text-4xl lg:text-5xl font-semibold text-white tracking-tight">{title}</h1>
            <div className="mt-2 text-sm text-white/60">{subtitle}</div>

            <div className="mt-8">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
