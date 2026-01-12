type Props = {
  className?: string;
  imageUrl: string;
  title: React.ReactNode;
  description?: string;
}


export default function Banner({ className, imageUrl, title, description }: Props) {
  return (
    <section className={`relative overflow-hidden bg-black ${className ?? ""}`}>
      <div className="relative min-h-[220px] md:min-h-[260px] lg:min-h-[280px]">
        <img
          src={imageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
          draggable={false}
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/15" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-black/70" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_35%,rgba(0,0,0,0.75)_100%)]" />

        <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-12 gap-6 px-6 py-10 md:px-10 md:py-14">
          <div className="col-span-12 lg:col-span-7">
            <h2 className="whitespace-pre-line text-4xl font-medium leading-[1.05] tracking-tight text-white md:text-5xl lg:text-6xl">
              {title}
            </h2>
          </div>

          <div className="col-span-12 lg:col-span-5 lg:flex lg:items-center lg:justify-end">
            <p className="max-w-md text-sm leading-relaxed text-white/75 md:text-base">
              {description}
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}