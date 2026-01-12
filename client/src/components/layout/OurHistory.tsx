import type React from "react";


type Stat = { value: string;  label: React.ReactNode }

type Props = {
  variant: 'standard' | 'elite';
  heading: string;
  paragraphs: string[];
  image: React.ReactNode;
  stats: Stat[];
}

export default function OurHistory({ variant, heading, paragraphs, image, stats = [] }: Props) {
  
  const isStandard = variant === 'standard'

  return (
    <section className="w-full">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-6 lg:gap-10 grid-cols-1 lg:grid-cols-2 items-stretch ">
          <div className={`relative overflow-hidden ${ isStandard ? 'lg:order-2' : '' }`}>
            {image}
          </div>
          <div className={`flex flex-col justify-center ${ isStandard ? 'lg:order-1' : 'lg:order-2'}`}>
            <h2 className="text-[39px] sm:text-4xl text-white font-semibold leading-tight">
              {heading}
            </h2>
            
            <div className="mt-4 space-y-4">
              {paragraphs.map((p, i) => (
                <p key={i} className="text-sm text-white sm:text-base leading-relaxed opacity-80">
                  {p}
                </p>
              ))}
            </div>

            <div className={`mt-8 ${ isStandard ? 'space-y-6' : 'grid grid-cols-1 sm:grid-cols-3 gap-6' }`}>
                {stats.map((s, i) =>(
                  <div key={i}>
                    <h2 className="text-[39px]  text-primary">
                      {s.value}
                    </h2>
                    <h3 className="mt-1 tetx-xs text-white opacity-70">
                      {s.label}
                    </h3>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}