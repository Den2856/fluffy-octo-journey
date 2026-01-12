import { useEffect, useState } from "react";

export function useMediaQuery(query: string) {
  const get = () => (typeof window !== "undefined" && "matchMedia" in window ? window.matchMedia(query).matches : false);
  const [matches, setMatches] = useState(get);

  useEffect(() => {
    if (!("matchMedia" in window)) return;
    const m = window.matchMedia(query);
    const onChange = () => setMatches(m.matches);

    onChange();
    if ("addEventListener" in m) m.addEventListener("change", onChange);
    else (m as any).addListener(onChange);

    return () => {
      if ("removeEventListener" in m) m.removeEventListener("change", onChange);
      else (m as any).removeListener(onChange);
    };
  }, [query]);

  return matches;
}
