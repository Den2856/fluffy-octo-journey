import { Link } from "react-router";
import { ArrowRight } from "lucide-react"

export default function Hero() {
  return (
    <section className="relative h-[96vh] flex items-end overflow-hidden">
      <video 
        src="/hero.webm"
        muted autoPlay loop playsInline preload="metadata" 
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="absolute inset-0 bg-black/55" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/35 to-black/15" />

      <div className="relative z-10 w-full">
        <div className="max-w-[1440px] mx-auto px-4 py-10 md:py-16">
          <div className="grid gap-8 md:grid-cols-12 md:items-start">
            <h1 className="md:col-span-7 text-white font-medium tracking-tight leading-[0.95] text-[34px] sm:text-5xl md:text-[61px] lg:text-[61px]">
              Drive Beyond Limits
              <br />
              Live Beyond Time
            </h1>

            <div className="md:col-span-5 md:pt-2">
              <p className="text-white/85 text-sm md:text-base leading-relaxed max-w-[520px]">
                Renting a luxury car should feel as smooth as the ride itself.
                That’s why we’ve simplified everything — from browsing our
                collection to booking in minutes.
              </p>

              <Link to="/fleet" className="group inline-flex items-center gap-3 mt-6 text-white font-semibold text-sm md:text-base">
                <span className="relative">
                  Browse Our Fleet
                  <span className="absolute left-0 -bottom-2 h-[5px] w-1/2 bg-primary transition-all duration-500 group-hover:w-full" />
                </span>
                
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  <ArrowRight size={16} />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
