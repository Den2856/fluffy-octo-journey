import { ArrowRight, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type FaqItem = {
  q: string,
  a?: string
}

type Variant = "home" | "car"

type Props = {
  variant: Variant,
  title?: React.ReactNode,
  subtitle?: string,
  contactLabel?: string,
  to?: string,
  items: FaqItem[]
}

export default function FAQSection({ 
  variant,
  title = <>Your Questions <br /> — Answered</>,
  subtitle = "Our dedicated team of experts is committed to understanding your unique needs and objectives, working closely with you to develop and execute.",
  contactLabel = "Contact Us",
  to = "/contact",
  items
}: Props) {

  const [open, setOpen] = useState<number | null>(null)
  const reduceMotion = useReducedMotion();
  
  const t = (d = 0.26) => reduceMotion ? { duration: 0 } : { duration: d, ease: [0.22, 1, 0.36, 1] as const }

  return (
    <section className="w-full">
      <div className="flex items-center justify-between gap-10 max-lg:flex-col">
        <h2 className="text-[49px] tracking-tight text-white">
          {title}
        </h2>
        <div className="max-w-[520px]">
          <p className="text-base leading-7 text-white">{subtitle}</p>

          {variant === "home" && (
            <Link to={to} className="mt-4 inline-flex items-center gap-3 text-sm font-medium text-white/85 hover:text-white">
              <span className="h-[4px] w-6 bg-primary" />
              {contactLabel}
            </Link>
          )}
        </div>
      </div>   

      <div className="mt-12 space-y-[15px]">
        {items.map((it, i) => {
          const isOpen = open === i;
          const id = `faq-${i}`

          return (
            <motion.div key={it.q} layout className={`border border-white/10 bg-dark-200 ${ isOpen ? "bg-dark-200/90" : "bg-dark-200" }`}>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={id}
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full p-4 text-left text-base text-white transition-colors duration-300 hover:text-white flex items-center justify-between gap-4"
              >
                <span>{it.q}</span>

                <motion.span
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={t(0.22)}
                  className="shrink-0 text-white/90"
                >
                  <ChevronDown size={18} />
                </motion.span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && it.a && (
                  <motion.div
                    key="content"
                    id={id}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className={`p-4 pt-0 text-base leading-7 text-white/60`}>
                      {it.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {variant === "car" && (
        <Link to={to}>
          <div className="mt-[15px] border border-white/10 bg-dark-200 p-4 group hover:bg-primary transition-colors duration-500 ease-in-out">
            <h3 className="text-[25px] font-semibold text-white">Still Got Questions?</h3>
            <p className="mt-1 max-w-[60ch] text-sm leading-7 text-white/90">
              We're here to help. Reach out to our team and we'll get back to you as soon as possible.
            </p>

            <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-white hover:text-white/90">
              Contact Us Today <span className="text-primary group-hover:text-white transition-colors duration-500 ease-in-out"> <ArrowRight size={16} /> </span>
            </span>
          </div>
        </Link>

      )}
    </section>
  );
}