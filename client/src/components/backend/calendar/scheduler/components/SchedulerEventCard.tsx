import type { EventContentArg } from "@fullcalendar/core";
import { initials } from "../utils";

export function renderSchedulerEventContent(arg: EventContentArg) {
  const ep = arg.event.extendedProps as any;
  const kind = String(ep.type || "pickup") as "pickup" | "return";
  const kindKey: "pickup" | "return" = kind === "return" ? "return" : "pickup";

  const tintClass = {
    pickup: "bg-sky-200 border-sky-100",
    return: "bg-[#ffdbdf] border-rose-100",
  }[kindKey];

  const dotClass = {
    pickup: "bg-sky-400",
    return: "bg-primary",
  }[kindKey];


  const timeText = String(arg.timeText || "").toUpperCase();
  const title2 = String(arg.event.title || ep.title || "Vehicle");

  const customer = String(ep.customer || "");
  const ref = String(ep.ref || "");
  const line2 = customer || ref;

  const init = initials(line2);

  return (
    <div className={"h-full w-full rounded-md px-2 py-1.5 border border-white/10 bg-white/5 " + tintClass}>
      <div className="text-[11px] text-[#203145]">{timeText}</div>

      <div className="mt-0.5 text-[13px] font-semibold text-[#203145] truncate">{title2}</div>

      <div className="mt-1 flex items-center gap-2">
        <span className={"h-2 w-2 rounded-full " + dotClass} />
        <span className="text-[12px] text-[#203145] truncate">{line2}</span>

        <span className="ml-auto h-5 w-5 rounded-full grid place-items-center border border-white/10 bg-black/30 text-[10px] text-[#203145]">
          {init}
        </span>
      </div>
    </div>
  );
}
