import { useEffect, useMemo, useRef, useState } from "react";

import type { DatesSetArg } from "@fullcalendar/core";
import type FullCalendar from "@fullcalendar/react";

import { API } from "../../../types/adminOrders.types";
import "./OrdersScheduler.css";

import type { CalendarEvent, CalendarType, OrderLite } from "./scheduler/types";
import { errMsg, fmtMonthYear, insideRect } from "./scheduler/utils";
import { configureAxios, fetchCalendarEvents, fetchUnscheduledOrders, patchOrderSchedule } from "./scheduler/api";

import SchedulerHeader from "./scheduler/components/SchedulerHeader";
import SchedulerLegend from "./scheduler/components/SchedulerLegend";
import SchedulerCalendar from "./scheduler/components/SchedulerCalendar";
import SchedulerTypeToggle from "./scheduler/components/SchedulerTypeToggle";
import UnscheduledSheet from "./scheduler/components/UnscheduledSheet";
import { renderSchedulerEventContent } from "./scheduler/components/SchedulerEventCard";

export default function OrdersScheduler() {
  const calendarRef = useRef<FullCalendar | null>(null);

  const [type, setType] = useState<CalendarType>("all");
  const [view, setView] = useState<"timeGridWeek" | "timeGridDay">("timeGridWeek");

  const [title, setTitle] = useState(() => fmtMonthYear(new Date()));
  const [range, setRange] = useState<{ from: Date; to: Date } | null>(null);

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const [toast, setToast] = useState<string>("");

  const [panelOpen, setPanelOpen] = useState(false);
  const [unscheduled, setUnscheduled] = useState<OrderLite[]>([]);
  const [uq, setUq] = useState("");

  const [trashArmed, setTrashArmed] = useState(false);

  useEffect(() => {
    configureAxios(API);
  }, []);

  function api() {
    return calendarRef.current?.getApi?.() || null;
  }

  function goToday() {
    const a = api();
    a && a.today();
  }
  function goPrev() {
    const a = api();
    a && a.prev();
  }
  function goNext() {
    const a = api();
    a && a.next();
  }
  function changeView(v: "timeGridWeek" | "timeGridDay") {
    const a = api();
    a && a.changeView(v);
    setView(v);
  }

  async function loadCalendar(from: Date, to: Date, t: CalendarType) {
    setLoading(true);
    try {
      const items = await fetchCalendarEvents(from, to, t);
      setEvents(items);
    } catch (e: any) {
      setEvents([]);
      setToast(errMsg(e, "Failed to load calendar"));
    } finally {
      setLoading(false);
    }
  }

  async function loadUnscheduled(q: string) {
    try {
      const items = await fetchUnscheduledOrders(q);
      setUnscheduled(items);
    } catch (e: any) {
      setUnscheduled([]);
      setToast(errMsg(e, "Failed to load orders"));
    }
  }

  useEffect(() => {
    if (!panelOpen) return;
    void loadUnscheduled(uq);
  }, [panelOpen]);

  useEffect(() => {
    if (!panelOpen) return;
    const t = setTimeout(() => void loadUnscheduled(uq), 350);
    return () => clearTimeout(t);
  }, [uq, panelOpen]);

  function onDatesSet(arg: DatesSetArg) {
    const start = arg.start;
    const end = arg.end;

    setRange({ from: start, to: end });
    setTitle(fmtMonthYear(arg.view.currentStart || start));

    void loadCalendar(start, end, type);
  }

  useEffect(() => {
    if (!range) return;
    void loadCalendar(range.from, range.to, type);
  }, [type]);

  async function removeSchedule(orderId: string, kind: "pickup" | "return") {
    try {
      await patchOrderSchedule(orderId, kind, null, null);
      range && void loadCalendar(range.from, range.to, type);
    } catch (e: any) {
      setToast(errMsg(e, "Failed to remove event"));
      range && void loadCalendar(range.from, range.to, type);
    }
  }

  async function onEventDrop(info: any) {
    const ep = info.event.extendedProps as any;
    const orderId = String(ep.orderId || "");
    const kind = String(ep.type || "") as "pickup" | "return";
    const eventId = String(info.event.id || `${orderId}:${kind}`);

    const nextStart = info.event.start ? info.event.start.toISOString() : "";
    const nextEnd = info.event.end ? info.event.end.toISOString() : "";

    const prev = events.find((e) => e.id === eventId);

    setEvents((p) => p.map((e) => (e.id === eventId ? { ...e, start: nextStart, end: nextEnd } : e)));

    try {
      await patchOrderSchedule(orderId, kind, info.event.start!, info.event.end!);
    } catch (e: any) {
      info.revert();
      prev && setEvents((p) => p.map((x) => (x.id === eventId ? { ...x, start: prev.start, end: prev.end } : x)));
      setToast(errMsg(e, "Failed to update schedule"));
    }
  }

  async function onEventResize(info: any) {
    const ep = info.event.extendedProps as any;
    const orderId = String(ep.orderId || "");
    const kind = String(ep.type || "") as "pickup" | "return";
    const eventId = String(info.event.id || `${orderId}:${kind}`);

    const nextStart = info.event.start ? info.event.start.toISOString() : "";
    const nextEnd = info.event.end ? info.event.end.toISOString() : "";

    const prev = events.find((e) => e.id === eventId);

    setEvents((p) => p.map((e) => (e.id === eventId ? { ...e, start: nextStart, end: nextEnd } : e)));

    try {
      await patchOrderSchedule(orderId, kind, info.event.start!, info.event.end!);
    } catch (e: any) {
      info.revert();
      prev && setEvents((p) => p.map((x) => (x.id === eventId ? { ...x, start: prev.start, end: prev.end } : x)));
      setToast(errMsg(e, "Failed to resize schedule"));
    }
  }

  async function onEventReceive(info: any) {
    const ep = info.event.extendedProps as any;
    const orderId = String(ep.orderId || "");
    const kind = String(ep.type || "pickup") as "pickup" | "return";
    const eventId = `${orderId}:${kind}`;

    try {
      info.event.setProp("id", eventId);
    } catch {}

    const startIso = info.event.start ? info.event.start.toISOString() : "";
    const endIso = info.event.end ? info.event.end.toISOString() : "";

    setEvents((p) => {
      const exists = p.some((x) => x.id === eventId);
      if (exists) return p.map((x) => (x.id === eventId ? { ...x, start: startIso, end: endIso } : x));

      return [
        ...p,
        {
          id: eventId,
          orderId,
          type: kind,
          start: startIso,
          end: endIso,
          title: String(info.event.title || ""),
          customer: "",
          ref: "",
          status: "",
          vehicleId: null,
          thumbnailUrl: null,
        },
      ];
    });

    try {
      await patchOrderSchedule(orderId, kind, info.event.start!, info.event.end!);
      range && void loadCalendar(range.from, range.to, type);
    } catch (e: any) {
      info.revert();
      setEvents((p) => p.filter((x) => x.id !== eventId));
      setToast(errMsg(e, "Failed to place order"));
    }
  }

  function onEventDragStart(_: any) {
    setTrashArmed(true);
  }

  function onEventDragStop(info: any) {
    setTrashArmed(false);

    const trash = document.getElementById("calendar-trash") as HTMLElement | null;
    if (!trash) return;

    const x = info.jsEvent?.clientX;
    const y = info.jsEvent?.clientY;
    if (typeof x !== "number" || typeof y !== "number") return;

    const hit = insideRect(trash, x, y);
    if (!hit) return;

    const ep = info.event.extendedProps as any;
    const orderId = String(ep.orderId || "");
    const kind = String(ep.type || "pickup") as "pickup" | "return";

    info.event.remove();
    void removeSchedule(orderId, kind);
  }

  const viewLabel = { timeGridWeek: "Week", timeGridDay: "Day" }[view];

  const fcEvents = useMemo(
    () =>
      events.map((e) => ({
        id: e.id,
        title: e.title,
        start: e.start,
        end: e.end,
        extendedProps: {
          orderId: e.orderId,
          type: e.type,
          customer: e.customer,
          ref: e.ref,
          status: e.status,
          vehicleId: e.vehicleId,
          thumbnailUrl: e.thumbnailUrl,
        },
      })),
    [events]
  );

  return (
    <div className="orders-scheduler rounded-2xl bg-black/30 ring-1 ring-white/10 overflow-hidden">
      <SchedulerHeader
        title={title}
        type={type}
        onTypeChange={setType}
        onToday={goToday}
        onPrev={goPrev}
        onNext={goNext}
        onOpenOrders={() => setPanelOpen(true)}
        viewLabel={viewLabel}
        onToggleView={() => changeView(view === "timeGridWeek" ? "timeGridDay" : "timeGridWeek")}
        trashArmed={trashArmed}
      />

      <SchedulerLegend loading={loading} />

      <SchedulerCalendar
        calendarRef={calendarRef as any}
        view={view}
        events={fcEvents}
        onDatesSet={onDatesSet}
        onEventDrop={onEventDrop}
        onEventResize={onEventResize}
        onEventReceive={onEventReceive}
        onEventDragStart={onEventDragStart}
        onEventDragStop={onEventDragStop}
        renderEventContent={renderSchedulerEventContent}
      />

      {toast ? (
        <div className="px-4 py-3 border-t border-white/10 bg-red-500/10 text-red-200 text-[13px]">{toast}</div>
      ) : null}

      <UnscheduledSheet
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        q={uq}
        onQChange={setUq}
        items={unscheduled}
      />

      <div className="md:hidden flex items-center gap-2 px-3 py-3 border-t border-white/10 bg-black/20">
        <SchedulerTypeToggle value={type} onChange={setType} />
      </div>
    </div>
  );
}
