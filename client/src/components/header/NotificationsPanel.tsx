import { AnimatePresence, motion } from "framer-motion";
import { Bell, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { NotificationItem } from "./useNotifications";
import { useLockScroll } from "../../hooks/useLockScroll";

function clamp2Style() {
  return {
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical" as const,
    overflow: "hidden",
  };
}

function ListBody({ loading, items, onMarkOneRead, onGo, close, }: { loading: boolean; items: NotificationItem[]; onMarkOneRead: (id: string) => void; onGo: (n: NotificationItem) => void; close: () => void; }) {

  if (loading) return <div className="px-4 py-6 text-[12px] text-white/60">Loading…</div>;
  if (!items.length) return <div className="px-4 py-6 text-[12px] text-white/60">No notifications</div>;

  return (
    <div className="p-3">
      {items.map((n) => {
        const isUnread = !n.readAt;
        return (
          <button
            key={n._id}
            type="button"
            onClick={() => { if (isUnread) onMarkOneRead(n._id); onGo(n); close(); }}
            className="w-full text-left rounded-2xl border border-white/10 bg-dark-200 px-4 py-3 mb-2 hover:bg-[#1b1b1b] transition"
          >
            <div className="flex items-start gap-3">
              <span className={`mt-2 h-2.5 w-2.5 rounded-full shrink-0 ${isUnread ? "bg-primary" : "bg-white/15"}`} />
              <div className="min-w-0">
                <div className="text-[13px] font-medium text-white truncate">{n.title}</div>
                {n.body ? (
                  <div className="mt-1 text-[12px] text-white/60" style={clamp2Style()}>
                    {n.body}
                  </div>
                ) : null}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default function NotificationsPanel({
  isMobile,
  open,
  setOpen,
  unread,
  unreadBadge,
  loading,
  items,
  onMarkAllRead,
  onMarkOneRead,
  onGo,
}: {
  isMobile: boolean;
  open: boolean;
  setOpen: (v: boolean) => void;
  unread: number;
  unreadBadge: string;
  loading: boolean;
  items: NotificationItem[];
  onMarkAllRead: () => void;
  onMarkOneRead: (id: string) => void;
  onGo: (n: NotificationItem) => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const shouldLock = open && !isMobile;
  useLockScroll(shouldLock);

  const badge =
    unread > 0 ? (
      <span className="absolute -right-1 -top-1 grid h-5 min-w-[20px] place-items-center rounded-full bg-primary px-1 text-[11px] font-semibold text-white">
        {unreadBadge}
      </span>
    ) : null;

  const close = () => setOpen(false);

  const Desktop = (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative inline-flex items-center justify-center h-11 w-11 rounded-2xl border border-white/10 bg-dark-200 text-white/85 hover:bg-dark-100"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {badge}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute right-0 mt-[10px] w-[360px] max-w-[92vw] overflow-hidden rounded-2xl border border-white/10 bg-dark-200 shadow-2xl"
          >
            <div className="flex items-center justify-between px-4 py-3">
              <div className="text-sm font-semibold text-white">Notifications</div>
              <button
                type="button"
                onClick={onMarkAllRead}
                className="text-[12px] text-white/70 hover:text-white"
              >
                Mark all read
              </button>
            </div>
            <div className="h-px bg-white/10" />
            <div className="myScroll max-h-[33vh] overflow-auto">
              <ListBody loading={loading} items={items} onMarkOneRead={onMarkOneRead} onGo={onGo} close={close} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const MobileButton = (
    <button
      type="button"
      className="relative inline-flex items-center justify-center h-10 w-10 rounded-2xl border border-white/10 bg-dark-200 text-white/85 hover:bg-dark-100"
      aria-label="Notifications"
      onClick={() => setOpen(true)}
    >
      <Bell size={18} />
      {badge}
    </button>
  );


  const MobileModal =
    mounted && isMobile && open
      ? createPortal(
          <AnimatePresence>
            <motion.button
              type="button"
              className="fixed inset-0 z-[2147483646] bg-black/85 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
            />

            <motion.div
              className="fixed inset-0 z-[2147483647] md:hidden bg-[#0e0e0e]"
              initial={{ y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 18, opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <div className="flex items-center justify-between gap-3 px-4 py-4 border-b border-white/10">
                <div className="text-[15px] font-semibold text-white">Notifications</div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onMarkAllRead}
                    className="h-10 rounded-2xl border border-white/10 bg-[#141414] px-3 text-[12px] text-white/80 hover:text-white hover:bg-[#1b1b1b]"
                  >
                    Mark all read
                  </button>

                  <button
                    type="button"
                    className="h-10 w-10 grid place-items-center rounded-2xl border border-white/10 bg-[#141414] text-white/90 hover:bg-[#1b1b1b]"
                    onClick={close}
                    aria-label="Close notifications"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="h-[calc(100vh-72px)] overflow-auto">
                <ListBody loading={loading} items={items} onMarkOneRead={onMarkOneRead} onGo={onGo} close={close} />
              </div>
            </motion.div>
          </AnimatePresence>,
          document.body
        )
      : null;

  return (
    <>
      {!isMobile ? Desktop : MobileButton}
      {MobileModal}
    </>
  );
}
