import { useLayoutEffect } from "react";

export function useLockScroll(locked: boolean) {
  useLayoutEffect(() => {
    if (!locked) return;

    const body = document.body;
    const html = document.documentElement;

    const prevBodyOverflow = body.style.overflow;
    const prevBodyPaddingRight = body.style.paddingRight;
    const prevHtmlOverflow = html.style.overflow;

    const scrollbar = -(window.innerWidth - html.clientWidth);

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      body.style.paddingRight = prevBodyPaddingRight;
    };
  }, [locked]);
}
