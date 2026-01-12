import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { DatesSetArg } from "@fullcalendar/core";

import { fmtDayHeader } from "../utils";

type Props = {
  calendarRef: React.MutableRefObject<any>;
  
  view: "timeGridWeek" | "timeGridDay";
  events: any[];

  onDatesSet: (arg: DatesSetArg) => void;
  onEventDrop: (info: any) => void;
  onEventResize: (info: any) => void;
  onEventReceive: (info: any) => void;
  onEventDragStart: (info: any) => void;
  onEventDragStop: (info: any) => void;

  renderEventContent: (arg: any) => any;
};

export default function SchedulerCalendar({
  calendarRef,
  view,
  events,
  onDatesSet,
  onEventDrop,
  onEventResize,
  onEventReceive,
  onEventDragStart,
  onEventDragStop,
  renderEventContent,
}: Props) {
  return (
    <div className="relative">
      <FullCalendar
        ref={(r) => { calendarRef.current = r; }}
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView={view}
        headerToolbar={false}
        allDaySlot={false}
        nowIndicator={true}
        editable={true}
        droppable={true}
        selectable={false}
        slotMinTime="08:00:00"
        slotMaxTime="21:00:00"
        slotDuration="00:30:00"
        eventOverlap={true}
        eventMaxStack={3}
        height="auto"
        events={events}
        datesSet={onDatesSet}
        eventDrop={onEventDrop}
        eventResize={onEventResize}
        eventReceive={onEventReceive}
        eventDragStart={onEventDragStart}
        eventDragStop={onEventDragStop}
        eventContent={renderEventContent}
        dayHeaderContent={(arg) => {
          const { num, wd } = fmtDayHeader(arg.date);
          return (
            <div className="flex flex-col items-center justify-center py-2">
              <div className="text-[14px] font-semibold text-white/85">{num}</div>
              <div className="text-[12px] text-white/55">{wd}</div>
            </div>
          );
        }}
        slotLabelContent={(arg) => {
          const t = arg.date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
          return <span>{t}</span>;
        }}
      />
    </div>
  );
}
