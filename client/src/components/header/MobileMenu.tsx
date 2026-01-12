import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Shield, User, X } from "lucide-react";
import { Link } from "react-router-dom";

const NAV_LINKS = [
  { name: "Home", path: "/" },
  { name: "Fleet", path: "/fleet" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
];

export default function MobileMenu({
  open,
  setOpen,
  user,
  displayName,
  role,
  initials,
  isAdmin,
  returnTo,
  onLogout,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  user: any;
  displayName: string;
  role: string;
  initials: string;
  isAdmin: boolean;
  returnTo: string;
  onLogout: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />

          <motion.nav
            className="fixed left-0 right-0 top-16 bottom-0 z-50 md:hidden border-t border-white/10 bg-dark-200 shadow-2xl"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <div className="flex items-center justify-between px-4 py-4">
              <div className="text-[15px] font-semibold text-white">Menu</div>
              <button
                type="button"
                className="h-10 w-10 grid place-items-center rounded-2xl border border-white/10 bg-dark-100 text-white/85"
                onClick={() => setOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-4 pb-8 overflow-auto h-[calc(100vh-64px-72px)]">
              <div className="grid gap-3">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="block rounded-2xl border border-white/10 bg-dark-100 px-4 py-3 text-white/85 hover:text-primary transition-colors duration-300"
                    onClick={() => setOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>

              <div className="h-px bg-white/10 my-5" />

              {!user ? (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to={`/login?returnTo=${returnTo}`}
                    className="h-11 grid place-items-center rounded-2xl border border-white/10 bg-dark-100 text-white/85"
                    onClick={() => setOpen(false)}
                  >
                    Log in
                  </Link>
                  <Link
                    to={`/register?returnTo=${returnTo}`}
                    className="h-11 grid place-items-center rounded-2xl bg-primary text-white font-medium"
                    onClick={() => setOpen(false)}
                  >
                    Sign up
                  </Link>
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-dark-100 p-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-dark-200 text-sm font-semibold text-white">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-white">{displayName}</div>
                      <div className="text-xs text-white/45">{role}</div>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-2">
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 rounded-xl border border-white/10 bg-dark-200 px-3 py-2 text-sm text-white/80"
                      onClick={() => setOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin/orders"
                        className="flex items-center gap-2 rounded-xl border border-white/10 bg-dark-200 px-3 py-2 text-sm text-white/80"
                        onClick={() => setOpen(false)}
                      >
                        <Shield className="h-4 w-4" />
                        Admin dashboard
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={onLogout}
                      className="flex items-center gap-2 rounded-xl border border-white/10 bg-dark-200 px-3 py-2 text-sm text-white/80"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}
