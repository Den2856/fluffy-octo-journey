import { Menu, X } from "lucide-react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthProvider";
import { useMediaQuery } from "./header/useMediaQuery";
import { useNotifications } from "./header/useNotifications";
import NotificationsPanel from "./header/NotificationsPanel";
import UserMenu from "./header/UserMenu";
import MobileMenu from "./header/MobileMenu";

const NAV_LINKS = [
  { name: "Home", path: "/" },
  { name: "Fleet", path: "/fleet" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
];

export default function Header() {

  const { user, logout } = useAuth() as any;

  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 767px)");

  const returnTo = useMemo(() => {
    const p = location.pathname + location.search;
    return encodeURIComponent(p === "/login" || p === "/register" ? "/" : p);
  }, [location.pathname, location.search]);

  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const ticking = useRef(false);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);


  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setMobileMenuOpen(false);
      setNotifOpen(false);
      setUserMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const locked = mobileMenuOpen || (isMobile && notifOpen);
    document.body.style.overflow = locked ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen, notifOpen, isMobile]);

  useEffect(() => {
    if (isMobile) {
      setHidden(false);
      return;
    }

    lastY.current = window.scrollY;

    const onScroll = () => {
      if (mobileMenuOpen || notifOpen || userMenuOpen) return;

      const currentY = window.scrollY;
      const deltaY = currentY - lastY.current;
      const threshold = 10;

      if (!ticking.current) {
        ticking.current = true;
        requestAnimationFrame(() => {
          if (deltaY > threshold && currentY > 10) setHidden(true);
          if (deltaY < -threshold) setHidden(false);
          lastY.current = currentY;
          ticking.current = false;
        });
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isMobile, mobileMenuOpen, notifOpen, userMenuOpen]);

  useEffect(() => {
    if (mobileMenuOpen || notifOpen || userMenuOpen) setHidden(false);
  }, [mobileMenuOpen, notifOpen, userMenuOpen]);

  const displayName = (user?.name?.trim() || user?.email?.split("@")?.[0] || "Account") as string;
  const initials = (displayName?.[0] || "O").toUpperCase();
  const role = (user?.role || "user") as string;
  const isAdmin = role === "admin";

  const notifs = useNotifications(!!user, notifOpen);

  async function handleLogout() {
    try {
      await logout?.();
    } finally {
      setUserMenuOpen(false);
      setMobileMenuOpen(false);
      setNotifOpen(false);
      navigate("/");
    }
  }

  function goFromNotification(n: any) {
    if (n.type === "booking_ready" || n.type === "booking_changed" || n.type === "order_status") {
      navigate("/profile");
      return;
    }
    navigate("/profile");
  }

  return (
    <>
      <header className={`fixed left-0 right-0 top-0 z-50 h-16 border-b border-white/10 bg-bg/80 backdrop-blur transition-transform duration-300 ${hidden ? "-translate-y-full" : "translate-y-0"}`}>
        <div className="max-w-[1440px] mx-auto h-full px-4 flex items-center justify-between gap-4">
          <Link to="/" className="text-xl text-white font-semibold tracking-[-0.09em]">
            opu—rent
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((l) => (
              <NavLink
                key={l.path}
                to={l.path}
                className={({ isActive }) =>
                  [
                    "text-sm transition-colors duration-300",
                    isActive ? "text-primary/90" : "text-white/70 hover:text-primary",
                  ].join(" ")
                }
              >
                {l.name}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {!isMobile && !user ? (
              <>
                <Link
                  to={`/login?returnTo=${returnTo}`}
                  className="h-10 inline-flex items-center justify-center rounded-2xl border border-white/10 bg-dark-200 px-4 text-sm text-white/80 hover:bg-dark-100 hover:text-white"
                >
                  Log in
                </Link>
                <Link
                  to={`/register?returnTo=${returnTo}`}
                  className="h-10 inline-flex items-center justify-center rounded-2xl bg-primary px-4 text-sm font-medium text-white hover:opacity-95"
                >
                  Sign up
                </Link>
              </>
            ) : null}

            {user ? (
              <div className="md:mr-1">
                <NotificationsPanel
                  isMobile={isMobile}
                  open={notifOpen}
                  setOpen={(v) => {
                    setNotifOpen(v);
                    if (v) setUserMenuOpen(false);
                  }}
                  unread={notifs.unread}
                  unreadBadge={notifs.unreadBadge}
                  loading={notifs.loading}
                  items={notifs.items}
                  onMarkAllRead={notifs.markAllRead}
                  onMarkOneRead={notifs.markOneRead}
                  onGo={goFromNotification}
                />
              </div>
            ) : null}

            {!isMobile && user ? (
              <UserMenu
                open={userMenuOpen}
                setOpen={(v) => {
                  setUserMenuOpen(v);
                  if (v) setNotifOpen(false);
                }}
                displayName={displayName}
                role={role}
                initials={initials}
                isAdmin={isAdmin}
                onLogout={handleLogout}
              />
            ) : null}

            {isMobile ? (
              <button
                type="button"
                className="inline-flex items-center justify-center h-10 w-10 rounded-2xl border border-white/10 bg-dark-200 text-white/85 hover:bg-dark-100"
                aria-expanded={mobileMenuOpen}
                onClick={() => {
                  setMobileMenuOpen((v) => !v);
                  setNotifOpen(false);
                  setUserMenuOpen(false);
                }}
              >
                {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            ) : null}
          </div>
        </div>
      </header>


      <MobileMenu
        open={mobileMenuOpen}
        setOpen={setMobileMenuOpen}
        user={user}
        displayName={displayName}
        role={role}
        initials={initials}
        isAdmin={isAdmin}
        returnTo={returnTo}
        onLogout={handleLogout}
      />
    </>
  );
}
