import { Link } from "react-router-dom"

type Props = {
  title: string
  description: React.ReactNode
  ctaLabel: string
  to: string
  imageUrl: string
}

export default function ReadyDriveBanner({ title, description, ctaLabel, to, imageUrl, }: Props) {
  return (
    <section className="overflow-hidden border border-white/10 bg-black">
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/70 via-black/25 to-black/10" />

        <div className="relative grid grid-cols-12">
          <div className="col-span-12 lg:col-span-6 p-6 md:p-10">
            <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-white">
              {title}
            </h2>

            <p className="mt-4 max-w-xl text-sm md:text-base leading-relaxed text-white/70">
              {description}
            </p>

            <Link to={to} className="group inline-flex items-center gap-3 mt-6 text-white font-semibold text-sm md:text-base">
              <div className="relative flex flex-row h-fit">
                {ctaLabel}
                <span className="absolute left-0 -bottom-2 h-[5px] w-1/2 bg-primary transition-all duration-500 group-hover:w-full" />
              </div>
            </Link>
          </div>

          <div className="col-span-12 lg:col-span-6 relative min-h-[180px] md:min-h-[220px] lg:min-h-[200px]">
            <img
              src={imageUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-right"
              loading="lazy"
              draggable={false}
            />

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/80 via-black/25 to-transparent" />

            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_35%,rgba(0,0,0,0.75)_100%)]" />
          </div>
        </div>
      </div>
    </section>
  )
}
