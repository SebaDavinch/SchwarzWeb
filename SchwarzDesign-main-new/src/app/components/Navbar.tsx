import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  Menu, X, User, LogOut, Bell, TrendingUp,
  Building2, Car, ClipboardList, Award, BookOpen,
  ChevronDown, Shield,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAdminData } from "../hooks/useAdminData";
import { useAuth } from "../hooks/useAuth";

/* ── role helpers ── */
const ROLE_LABELS: Record<string, string> = {
  owner: "Owner", dep_owner: "Dep. Owner", close: "Close",
  old: "Old", main: "Main", academy: "Academy",
};
const ROLE_COLORS: Record<string, string> = {
  owner: "#9b2335", dep_owner: "#c0392b", close: "#e67e22",
  old: "#8e44ad", main: "#2980b9", academy: "#27ae60",
};

function getMember(memberId: string) {
  try {
    const raw = localStorage.getItem("schwarz_admin_members");
    const arr = raw ? JSON.parse(raw) : [];
    return arr.find((m: { id: string }) => m.id === memberId) ?? null;
  } catch { return null; }
}

/* ── cabinet quick-links ── */
const CAB_LINKS = [
  { label: "Лента",         path: "/cabinet",                Icon: Bell },
  { label: "Профиль",       path: "/cabinet?tab=profile",    Icon: User },
  { label: "Контракты",     path: "/cabinet?tab=contracts",  Icon: ClipboardList },
  { label: "Достижения",    path: "/cabinet?tab=achievements", Icon: Award },
  { label: "Словарь РП",    path: "/cabinet?tab=glossary",   Icon: BookOpen },
];

/* ═══════════════════════════════════════════════
   DROPDOWN
   ═══════════════════════════════════════════════ */

function CabinetDropdown({ onClose }: { onClose: () => void }) {
  const { currentAccount, logout } = useAuth();
  const navigate = useNavigate();

  const member = currentAccount ? getMember(currentAccount.memberId) : null;
  const roleLabel = member ? (ROLE_LABELS[member.role] ?? member.role) : null;
  const roleColor = member ? (ROLE_COLORS[member.role] ?? "#888899") : "#888899";

  const handleLogout = () => {
    logout();
    onClose();
    navigate("/");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="absolute right-0 top-full mt-2 w-64 z-50 overflow-hidden"
      style={{
        background: "rgba(10,10,18,0.97)",
        border: "1px solid rgba(255,255,255,0.07)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(155,35,53,0.08)",
      }}
    >
      {/* Profile header */}
      <div className="px-4 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 shrink-0 border border-white/8 bg-[#0d0d15] overflow-hidden flex items-center justify-center">
            {currentAccount?.avatarDataUrl ? (
              <img
                src={currentAccount.avatarDataUrl}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={16} className="text-white/15" strokeWidth={1} />
            )}
          </div>

          {/* Name & role */}
          <div className="flex-1 min-w-0">
            <p
              className="text-white/85 truncate"
              style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.9rem", letterSpacing: "0.02em" }}
            >
              {member?.name ?? currentAccount?.username ?? "—"}
            </p>
            {roleLabel && (
              <div className="flex items-center gap-1 mt-0.5">
                <Shield size={9} strokeWidth={1.5} style={{ color: roleColor }} />
                <span
                  className="uppercase tracking-widest truncate"
                  style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.52rem", color: roleColor }}
                >
                  {roleLabel}
                </span>
              </div>
            )}
            {currentAccount?.bio && (
              <p
                className="text-white/20 truncate mt-0.5"
                style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.62rem" }}
              >
                {currentAccount.bio}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="py-1.5">
        {CAB_LINKS.map(({ label, path, Icon }) => (
          <Link
            key={path}
            to={path}
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-2.5 text-white/40 hover:text-white/80 hover:bg-white/[0.03] transition-all duration-200 group"
          >
            <Icon
              size={12}
              strokeWidth={1.5}
              className="text-white/20 group-hover:text-[#9b2335]/60 transition-colors"
            />
            <span
              className="uppercase tracking-wider"
              style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.65rem" }}
            >
              {label}
            </span>
          </Link>
        ))}
      </div>

      {/* Divider + logout */}
      <div className="border-t border-white/5 py-1.5">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-white/25 hover:text-[#ff3366]/60 hover:bg-[#ff3366]/[0.04] transition-all duration-200 group"
        >
          <LogOut
            size={12}
            strokeWidth={1.5}
            className="group-hover:text-[#ff3366]/50 transition-colors"
          />
          <span
            className="uppercase tracking-wider"
            style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.65rem" }}
          >
            Выйти
          </span>
        </button>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   NAVBAR
   ═══════════════════════════════════════════════ */

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { visibleNavItems } = useAdminData();
  const { session, currentAccount, logout } = useAuth();

  const navLinks = visibleNavItems.filter((link) => link.id !== "join");

  /* close dropdown on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* close on route change */
  useEffect(() => {
    setDropdownOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  const member = session ? getMember(session.memberId) : null;
  const roleColor = member ? (ROLE_COLORS[member.role] ?? "#888899") : "#888899";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-[100rem] mx-auto px-10 h-18 flex items-center justify-between">
        <Link
          to="/"
          className="text-[#9b2335] tracking-wider"
          style={{ fontSize: "1.4rem", fontFamily: "'Metal Mania', cursive" }}
        >
          SCHWARZ FAMILY
        </Link>

        {/* ── Desktop Nav ── */}
        <div className="hidden lg:flex items-center gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.id}
              to={link.path}
              className={`uppercase tracking-widest transition-colors duration-300 whitespace-nowrap ${
                location.pathname === link.path
                  ? "text-[#9b2335]"
                  : "text-white/60 hover:text-white"
              }`}
              style={{ fontSize: "0.65rem", fontFamily: "'Oswald', sans-serif" }}
            >
              {link.label}
            </Link>
          ))}

          {/* ── Auth area ── */}
          {session ? (
            /* Dropdown trigger */
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className={`flex items-center gap-2 px-2.5 py-1.5 border transition-all duration-300 ${
                  dropdownOpen || location.pathname.startsWith("/cabinet")
                    ? "border-[#9b2335]/40 bg-[#9b2335]/8 text-[#9b2335]"
                    : "border-white/8 text-white/40 hover:border-[#9b2335]/25 hover:text-white/70"
                }`}
              >
                {/* Mini avatar */}
                <div
                  className="w-5 h-5 overflow-hidden border flex items-center justify-center shrink-0"
                  style={{ borderColor: `${roleColor}40` }}
                >
                  {currentAccount?.avatarDataUrl ? (
                    <img
                      src={currentAccount.avatarDataUrl}
                      alt="av"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={9} strokeWidth={1.5} />
                  )}
                </div>

                <span
                  className="uppercase tracking-widest whitespace-nowrap"
                  style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.6rem" }}
                >
                  {member?.name ?? currentAccount?.username ?? "Кабинет"}
                </span>

                <motion.div animate={{ rotate: dropdownOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown size={10} strokeWidth={2} />
                </motion.div>
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <CabinetDropdown onClose={() => setDropdownOpen(false)} />
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* Login button */
            <Link
              to="/login"
              className={`flex items-center gap-1.5 px-3 py-1.5 border transition-all duration-300 uppercase tracking-widest whitespace-nowrap ${
                location.pathname === "/login"
                  ? "border-[#9b2335]/40 bg-[#9b2335]/10 text-[#9b2335]"
                  : "border-white/10 text-white/40 hover:border-[#9b2335]/30 hover:text-[#9b2335]/70"
              }`}
              style={{ fontSize: "0.6rem", fontFamily: "'Oswald', sans-serif" }}
            >
              <User size={11} strokeWidth={1.5} />
              Войти
            </Link>
          )}
        </div>

        {/* ── Mobile toggle ── */}
        <button
          className="lg:hidden text-white/60 hover:text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* ── Mobile Nav ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-[#0a0a0f]/97 backdrop-blur-xl border-b border-white/5 overflow-hidden"
          >
            <div className="px-6 py-4 flex flex-col gap-1">
              {/* Nav links */}
              {navLinks.map((link) => (
                <Link
                  key={link.id}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`uppercase tracking-widest transition-colors py-2.5 border-b border-white/5 ${
                    location.pathname === link.path
                      ? "text-[#9b2335]"
                      : "text-white/60 hover:text-white"
                  }`}
                  style={{ fontSize: "0.8rem", fontFamily: "'Oswald', sans-serif" }}
                >
                  {link.label}
                </Link>
              ))}

              {/* Cabinet section */}
              {session ? (
                <div className="pt-3 mt-1">
                  {/* Profile mini card */}
                  <div className="flex items-center gap-3 mb-3 px-1">
                    <div className="w-8 h-8 border border-white/10 bg-[#0d0d15] overflow-hidden flex items-center justify-center shrink-0">
                      {currentAccount?.avatarDataUrl ? (
                        <img src={currentAccount.avatarDataUrl} alt="av" className="w-full h-full object-cover" />
                      ) : (
                        <User size={14} className="text-white/15" strokeWidth={1} />
                      )}
                    </div>
                    <div>
                      <p className="text-white/70" style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.85rem" }}>
                        {member?.name ?? currentAccount?.username}
                      </p>
                      {member && (
                        <p className="uppercase tracking-widest"
                          style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.5rem", color: roleColor }}>
                          {ROLE_LABELS[member.role] ?? member.role}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Cabinet links */}
                  {CAB_LINKS.map(({ label, path, Icon }) => (
                    <Link
                      key={path}
                      to={path}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 py-2.5 text-white/40 hover:text-white/70 transition-colors border-b border-white/5"
                    >
                      <Icon size={12} strokeWidth={1.5} className="text-white/20" />
                      <span
                        className="uppercase tracking-wider"
                        style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.7rem" }}
                      >
                        {label}
                      </span>
                    </Link>
                  ))}

                  {/* Logout */}
                  <button
                    onClick={() => { logout(); setMobileOpen(false); navigate("/"); }}
                    className="w-full flex items-center gap-3 py-2.5 text-white/25 hover:text-[#ff3366]/50 transition-colors mt-1"
                  >
                    <LogOut size={12} strokeWidth={1.5} />
                    <span
                      className="uppercase tracking-wider"
                      style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.7rem" }}
                    >
                      Выйти
                    </span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 py-3 text-white/40 hover:text-[#9b2335]/70 transition-colors mt-2 border-t border-white/5"
                  style={{ fontSize: "0.8rem", fontFamily: "'Oswald', sans-serif" }}
                >
                  <User size={14} strokeWidth={1.5} />
                  <span className="uppercase tracking-widest">Войти в ЛК</span>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}