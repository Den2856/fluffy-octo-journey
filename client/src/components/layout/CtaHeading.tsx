import type React from "react";
import { Link } from "react-router-dom";

type CtaHeadingProps = {
  id?: string;
  title: React.ReactNode;
  text: string;
  btnText: React.ReactNode;
  btnLink: string;
};

export default function CtaHeading({ id, title, text, btnText, btnLink }: CtaHeadingProps) {
  return (
    <div className="max-w-[1440px]" id={id}>
      <div className="flex flex-row justify-between items-start flex-wrap gap-8">
        <h2 className=" text-white font-medium leading-[1.05] text-[34px] lg:text-[49px]">
          {title}
        </h2>

        <div className="md:pt-2">
          <p className="text-white/85 text-sm md:text-base leading-relaxed max-w-[520px]">
            {text}
          </p>

          <Link to={btnLink} className="group inline-flex items-center gap-3 mt-6 text-white font-semibold text-sm md:text-base">
            <div className="relative flex flex-row h-fit">
              {btnText}
              <span className="absolute left-0 -bottom-2 h-[5px] w-1/2 bg-primary transition-all duration-500 group-hover:w-full" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}