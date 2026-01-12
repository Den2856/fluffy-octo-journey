import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";

import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { DatesSetArg } from "@fullcalendar/core";

import { API } from "../types/adminOrders.types";
import "../components/backend/calendar/OrdersScheduler.css";

import type { CalendarEvent, CalendarType } from "../components/backend/calendar/scheduler/types";
import { configureAxios } from "../components/backend/calendar/scheduler/api";
import { errMsg, fmtMonthYear } from "../components/backend/calendar/scheduler/utils";

import SchedulerHeader from "../components/backend/calendar/scheduler/components/SchedulerHeader";
import SchedulerLegend from "../components/backend/calendar/scheduler/components/SchedulerLegend";
import SchedulerTypeToggle from "../components/backend/calendar/scheduler/components/SchedulerTypeToggle";
import { renderSchedulerEventContent } from "../components/backend/calendar/scheduler/components/SchedulerEventCard";
import Header from "../components/Header";

type MeResponse = {
  success: boolean;
  data: {
    user: { id: string; name: string; email: string; role: string };
  };
};

const MY_CAL_ENDPOINT = "/orders/my";

function pickItems(payload: any): any[] {
  const a = payload?.data?.items ?? payload?.data?.events ?? payload?.events ?? payload?.items ?? [];
  return Array.isArray(a) ? a : [];
}

function normalizeMyEvents(payload: any): CalendarEvent[] {
  const raw = pickItems(payload);

  return raw
    .map((x: any) => {
      const type = (x.type === "return" ? "return" : "pickup") as "pickup" | "return";
      const orderId = String(x.orderId ?? x.order?._id ?? x.order?._id ?? x.order ?? "");
      const start = String(x.start ?? x.from ?? "");
      const end = String(x.end ?? x.to ?? "");
      const id = String(x.id ?? x._id ?? (orderId ? `${orderId}:${type}` : ""));

      if (!id || !start || !end) return null;

      return {
        id,
        orderId,
        type,
        start,
        end,
        title: String(x.title ?? x.ref ?? (type === "pickup" ? "Pickup" : "Return")),
        customer: x.customer ? String(x.customer) : "",
        ref: x.ref ? String(x.ref) : "",
        status: x.status ? String(x.status) : "",
        vehicleId: x.vehicleId ?? null,
        thumbnailUrl: x.thumbnailUrl ?? null,
      } as CalendarEvent;
    })
    .filter(Boolean) as CalendarEvent[];
}

function MyOrdersCalendar({ enabled }: { enabled: boolean }) {
  const calendarRef = useRef<FullCalendar | null>(null);

  const [type, setType] = useState<CalendarType>("all");
  const [view, setView] = useState<"timeGridWeek" | "timeGridDay">("timeGridWeek");

  const [title, setTitle] = useState(() => fmtMonthYear(new Date()));
  const [range, setRange] = useState<{ from: Date; to: Date } | null>(null);

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

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
    setToast("");
    try {
      const r = await axios.get(MY_CAL_ENDPOINT, {
        params: { from: from.toISOString(), to: to.toISOString(), type: t },
      });
      setEvents(normalizeMyEvents(r.data));
    } catch (e: any) {
      setEvents([]);
      setToast(errMsg(e, "Failed to load calendar"));
    } finally {
      setLoading(false);
    }
  }

  function onDatesSet(arg: DatesSetArg) {
    const start = arg.start;
    const end = arg.end;

    setRange({ from: start, to: end });
    setTitle(fmtMonthYear(arg.view.currentStart || start));

    if (enabled) void loadCalendar(start, end, type);
  }

  useEffect(() => {
    if (!enabled) return;
    if (!range) return;
    void loadCalendar(range.from, range.to, type);
  }, [type, enabled]);

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
    <>
      <Header />
      <div className="orders-scheduler rounded-2xl bg-black/30 ring-1 ring-white/10 overflow-hidden">
        <SchedulerHeader
          title={title}
          type={type}
          onTypeChange={setType}
          onToday={goToday}
          onPrev={goPrev}
          onNext={goNext}
          onOpenOrders={undefined as any}
          viewLabel={viewLabel}
          onToggleView={() => changeView(view === "timeGridWeek" ? "timeGridDay" : "timeGridWeek")}
          trashArmed={false}
          showTrash={false}
          showOrdersButton={false}
        />

        <SchedulerLegend loading={loading} />

        {!enabled ? (
          <div className="px-4 py-4">
            <div className="rounded-2xl bg-red-500/10 ring-1 ring-red-500/20 p-4">
              <div className="text-[14px] font-semibold text-red-200">Not authenticated</div>
              <button
                onClick={() => (window.location.href = "/login")}
                className="mt-3 h-10 rounded-xl bg-white/5 ring-1 ring-white/10 px-3 text-[13px] text-white/80 hover:bg-white/10"
              >
                Go to login
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-[#0a0a0a]">
            <FullCalendar
              ref={(r) => void (calendarRef.current = r)}
              plugins={[timeGridPlugin, interactionPlugin]}
              initialView={view}
              height="auto"
              nowIndicator
              dayMaxEvents
              events={fcEvents}
              datesSet={onDatesSet}
              eventContent={renderSchedulerEventContent as any}
              editable={false}
              droppable={false}
              selectable={false}
              eventStartEditable={false}
              eventDurationEditable={false}
              eventResizableFromStart={false}
              headerToolbar={false}
              footerToolbar={false}
              titleFormat={undefined}
            />
          </div>
        )}

        {toast ? (
          <div className="px-4 py-3 border-t border-white/10 bg-red-500/10 text-red-200 text-[13px]">{toast}</div>
        ) : null}

        <div className="md:hidden flex items-center gap-2 px-3 py-3 border-t border-white/10 bg-black/20">
          <SchedulerTypeToggle value={type} onChange={setType} />
        </div>
      </div>
    </>
  );
}

export default function Profile() {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [meLoading, setMeLoading] = useState(true);

  useEffect(() => {
    configureAxios(API);
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      setMeLoading(true);
      try {
        const r = await axios.get("/auth/me");
        const u = r.data?.data ?? r.data?.user ?? r.data;
        if (alive) setMe(u ?? null);
      } catch {
        if (alive) setMe(null);
      } finally {
        if (alive) setMeLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const enabled = !meLoading && !!me;

  return (
    <div className="flex flex-col max-w-[1440px] mx-auto gap-6 h-min-content py-24 px-16 xl:py-18 xl:px-9 max-sm:py-1 max-sm:px-4">
      <MyOrdersCalendar enabled={enabled} />
    </div>
  );
}
