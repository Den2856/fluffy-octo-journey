import { useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { testimonials } from "../../data/testiomonial.data"
import { AssetImage } from "../ui/AssetImage"

export default function TestimonialsShowcase() {
  const items = useMemo(() => testimonials, [])
  const [active, setActive] = useState(0)

  const t = items[Math.min(active, Math.max(items.length - 1, 0))]
  if (!t) return null


  const mainSrc = t.image.url.startsWith("/") ? t.image.url : `/${t.image.url}`

  return (
    <section className="relative overflow-hidden border border-white/10 bg-black">
      <div className="relative min-h-[360px] md:min-h-[420px]">
        
        <div className="absolute inset-0">
          <AnimatePresence mode="wait">
            <motion.img
              key={mainSrc}
              src={`https://fluffy-octo-journey-k27p.onrender.com/api/v1${mainSrc}`}
              alt={t.image.alt ?? ""}
              className="size-full object-cover object-right"
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              draggable={false}
            />
          </AnimatePresence>


          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-transparent" />

          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_35%,rgba(0,0,0,0.75)_100%)]" />
        </div>

        <div className="relative z-10 grid grid-cols-12 gap-6 p-4 md:p-8">
          <div className="col-span-12 lg:col-span-5">
            <div className="leading-none text-primary select-none">
              <img src="/quote.svg" alt="qoute" className="size-6" />
            </div>

            <p className="mt-3 text-white/90 text-lg md:text-xl leading-snug">
              {t.quote}
            </p>

            <div className="mt-6 text-primary text-sm">— {t.author}</div>
          </div>

          <div className="hidden lg:block lg:col-span-7" />
        </div>

        <div className="absolute left-6 bottom-6 md:left-10 md:bottom-10 z-20 flex items-end gap-3">
          {items.map((it, i) => {
            const thumbSrc = it.image.url.startsWith("/")
              ? it.image.url
              : `/${it.image.url}`

            const isActive = i === active

            return (
              <button
                key={it.id}
                type="button"
                onClick={() => setActive(i)}
                className={
                  isActive
                    ? "relative h-14 w-24 overflow-hidden rounded-md border border-primary transition"
                    : "relative h-14 w-24 overflow-hidden rounded-md border border-white/10 transition hover:border-white/25"
                }
                aria-label={`Open testimonial ${i + 1}`}
              >
                <AssetImage
                  src={thumbSrc}
                  alt={it.image.alt ?? it.author}
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.03]"
                  loading="lazy"
                  draggable={false}
                />

                <span
                  className={
                    isActive
                      ? "absolute inset-x-0 bottom-0 h-[2px] bg-primary opacity-100"
                      : "absolute inset-x-0 bottom-0 h-[2px] bg-primary opacity-0"
                  }
                />
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
