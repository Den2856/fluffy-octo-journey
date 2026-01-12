import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LogOut, Shield, User } from "lucide-react";
import { Link } from "react-router-dom";

export default function UserMenu({ open, setOpen, displayName, role, initials, isAdmin, onLogout, }: {
  open: boolean;
  setOpen: (v: boolean) => void;
  displayName: string;
  role: string;
  initials: string;
  isAdmin: boolean;
  onLogout: () => void;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-dark-200 p-1 text-white/85 hover:bg-dark-100"
      >
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-dark-100 border border-white/10 text-sm font-semibold text-white">
          {initials}
        </span>

        <div className="leading-tight text-left">
          <div className="max-w-[160px] truncate text-sm font-medium text-white">{displayName}</div>
          <div className="text-xs text-white/45">{role}</div>
        </div>

        <ChevronDown size={16} className={`text-white/50 transition ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-[240px] overflow-hidden rounded-2xl border border-white/10 bg-dark-200 shadow-2xl"
          >
            <div className="p-2">
              <Link
                to="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white"
              >
                <User size={16} />
                Profile
              </Link>

              {isAdmin && (
                <Link
                  to="/admin/orders"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white"
                >
                  <Shield size={16} />
                  Admin dashboard
                </Link>
              )}

              <div className="my-2 h-px bg-white/10" />

              <button
                type="button"
                onClick={onLogout}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
