import { useState } from "react";
import { Link, useLocation } from "react-router";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAdminData } from "../hooks/useAdminData";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { visibleNavItems } = useAdminData();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-[100rem] mx-auto px-10 h-18 flex items-center justify-between">
        <Link
          to="/"
          className="font-['Russo_One'] text-[#9b2335] tracking-wider"
          style={{ fontSize: "1.25rem" }}
        >
          SCHWARZ FAMILY
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-4">
          {visibleNavItems.map((link) => (
            <Link
              key={link.id}
              to={link.path}
              className={`font-['Oswald'] uppercase tracking-widest transition-colors duration-300 whitespace-nowrap ${
                location.pathname === link.path
                  ? "text-[#9b2335]"
                  : "text-white/60 hover:text-white"
              }`}
              style={{ fontSize: "0.65rem" }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden text-white/60 hover:text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-white/5 overflow-hidden"
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              {visibleNavItems.map((link) => (
                <Link
                  key={link.id}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`font-['Oswald'] uppercase tracking-widest transition-colors ${
                    location.pathname === link.path
                      ? "text-[#9b2335]"
                      : "text-white/60 hover:text-white"
                  }`}
                  style={{ fontSize: "0.875rem" }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}