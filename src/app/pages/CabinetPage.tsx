import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Bell, User, TrendingUp, Building2, Car,
  ClipboardList, Award, LogOut,
  BookOpen, Camera, Shield,
  Image as ImageIcon,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useCabinetData, ROLE_LABELS, ROLE_COLORS } from "../hooks/useCabinetData";
import { CabinetFeed } from "../components/cabinet/CabinetFeed";
import { CabinetProfile } from "../components/cabinet/CabinetProfile";
import { CabinetUpgrades } from "../components/cabinet/CabinetUpgrades";
import { CabinetInfrastructure } from "../components/cabinet/CabinetInfrastructure";
import { CabinetVehicles } from "../components/cabinet/CabinetVehicles";
import { CabinetContracts } from "../components/cabinet/CabinetContracts";
import { CabinetAchievements } from "../components/cabinet/CabinetAchievements";
import { CabinetGlossary } from "../components/cabinet/CabinetGlossary";
import { Navbar } from "../components/Navbar";

type Tab =
  | "feed" | "profile" | "upgrades" | "infrastructure"
  | "vehicles" | "contracts" | "achievements" | "glossary";

interface Member {
  id: string; name: string; role: string;
  joinDate?: string; active: boolean;
}

const TABS: { id: Tab; label: string; Icon: typeof Bell }[] = [
  { id: "feed",           label: "Лента",         Icon: Bell },
  { id: "profile",        label: "Профиль",        Icon: User },
  { id: "upgrades",       label: "Улучшения",      Icon: TrendingUp },
  { id: "infrastructure", label: "Инфраструктура", Icon: Building2 },
  { id: "vehicles",       label: "Транспорт",      Icon: Car },
  { id: "contracts",      label: "Контракты",      Icon: ClipboardList },
  { id: "achievements",   label: "Достижения",     Icon: Award },
  { id: "glossary",       label: "Словарь РП",     Icon: BookOpen },
];

function getMember(id: string): Member | null {
  try {
    const raw = localStorage.getItem("schwarz_admin_members");
    const arr: Member[] = raw ? JSON.parse(raw) : [];
    return arr.find((m) => m.id === id) ?? null;
  } catch { return null; }
}

function daysIn(joinDate?: string) {
  if (!joinDate) return 0;
  return Math.max(0, Math.floor((Date.now() - new Date(joinDate).getTime()) / 86400000));
}

export function CabinetPage() {
  const navigate = useNavigate();
  const { session, currentAccount, logout, updateAccount } = useAuth();
  const cabinetData = useCabinetData();
  const avatarRef = useRef<HTMLInputElement>(null);
  const coverRef  = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<Tab>("feed");
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setUserMenuOpen(false);
    if (userMenuOpen) document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [userMenuOpen]);

  if (!session || !currentAccount) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
        <div className="text-center space-y-5">
          <p className="text-white/30 uppercase tracking-widest"
            style={{ fontFamily: "'Oswald',sans-serif", fontSize: "0.75rem" }}>
            Необходима авторизация
          </p>
          <Link to="/login"
            className="inline-block px-6 py-3 bg-[#9b2335] hover:bg-[#b52a40] text-white uppercase tracking-widest transition-all"
            style={{ fontFamily: "'Oswald',sans-serif", fontSize: "0.7rem" }}>
            Войти
          </Link>
        </div>
      </div>
    );
  }

  const member = getMember(session.memberId);
  const roleColor = member ? (ROLE_COLORS[member.role] ?? "#888899") : "#888899";
  const roleLabel = member ? (ROLE_LABELS[member.role] ?? member.role) : "—";
  const openContracts = cabinetData.contracts.filter(c => c.status === "open").length;
  const contractCount = cabinetData.getMemberContractCount(session.memberId);
  const achievementsEarned = cabinetData.userAchievements.filter(ua => ua.memberId === session.memberId).length;
  const days = daysIn(member?.joinDate);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => updateAccount(currentAccount.id, { avatarDataUrl: ev.target?.result as string });
    reader.readAsDataURL(file);
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => updateAccount(currentAccount.id, { avatarDataUrl: ev.target?.result as string });
    reader.readAsDataURL(file);
  };

  const go = (id: Tab) => setActiveTab(id);

  return (
    <div className="min-h-screen bg-[#0c0c13]" style={{ fontFamily: "'Oswald',sans-serif" }}>
      {/* ambient */}
      <div className="fixed top-0 right-0 w-[700px] h-[400px] bg-[#9b2335]/4 blur-[220px] rounded-full pointer-events-none z-0" />
      <div className="fixed bottom-0 left-1/4 w-[500px] h-[300px] bg-[#9b2335]/2 blur-[200px] rounded-full pointer-events-none z-0" />

      {/* ── Site Navbar ── */}
      <Navbar />

      {/* spacer for fixed navbar */}
      <div className="h-[72px]" />

      {/* ═══════════ BANNER ═══════════ */}
      <div className="relative h-[170px] bg-[#12121b] overflow-hidden">
        {(currentAccount as any).coverDataUrl ? (
          <img src={(currentAccount as any).coverDataUrl} alt="cover"
            className="w-full h-full object-cover opacity-55" />
        ) : (
          <div className="absolute inset-0"
            style={{ background: "linear-gradient(135deg,#0f0f18 0%,#1a0810 40%,#0d0d16 70%,#14101e 100%)" }}>
            <div className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage: `repeating-linear-gradient(45deg,#9b2335 0px,#9b2335 1px,transparent 1px,transparent 44px),
                  repeating-linear-gradient(-45deg,#9b2335 0px,#9b2335 1px,transparent 1px,transparent 44px)`,
              }} />
            <div className="absolute right-24 top-1/2 -translate-y-1/2 w-[240px] h-[240px] rounded-full"
              style={{ background: "radial-gradient(circle,#9b233322 0%,transparent 70%)" }} />
          </div>
        )}
        <button onClick={() => coverRef.current?.click()}
          className="absolute bottom-3 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-black/50 hover:bg-black/70 border border-white/10 backdrop-blur-sm text-white/45 hover:text-white/75 transition-all">
          <ImageIcon size={12} strokeWidth={1.5} />
          <span className="uppercase tracking-wider" style={{ fontSize: "0.52rem" }}>Сменить обложку</span>
        </button>
        <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
      </div>

      {/* ═══════════ BODY ═══════════ */}
      <div className="px-5 lg:px-10">
        <div className="flex flex-col lg:flex-row gap-0">

          {/* ── Profile card (floats up) ── */}
          <div className="lg:w-[230px] shrink-0 -mt-[72px] z-10 self-start mb-4 lg:mb-0">
            <div className="bg-[#12121b] border border-white/[0.07] p-5 flex flex-col items-center text-center gap-4">

              {/* Avatar */}
              <div className="relative -mt-1">
                <div className="p-[2.5px] rounded-full"
                  style={{ background: `linear-gradient(135deg,${roleColor}70,${roleColor}20)` }}>
                  <div className="w-[90px] h-[90px] rounded-full bg-[#0f0f18] overflow-hidden flex items-center justify-center border-[3px] border-[#12121b]">
                    {currentAccount.avatarDataUrl
                      ? <img src={currentAccount.avatarDataUrl} alt="avatar" className="w-full h-full object-cover" />
                      : <User size={34} className="text-white/15" strokeWidth={1} />}
                  </div>
                </div>
                <div className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-[#22c55e] border-2 border-[#12121b]" />
                <button onClick={() => avatarRef.current?.click()}
                  className="absolute bottom-0 left-0.5 w-6 h-6 rounded-full bg-[#9b2335] hover:bg-[#b52a40] flex items-center justify-center transition-colors shadow-lg">
                  <Camera size={10} />
                </button>
                <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>

              {/* Name + role */}
              <div>
                <p className="text-white" style={{ fontSize: "1rem", letterSpacing: "0.03em" }}>
                  {member?.name ?? currentAccount.username}
                </p>
                <div className="inline-flex items-center gap-1.5 mt-1.5 px-2 py-[3px]"
                  style={{ background: `${roleColor}18`, border: `1px solid ${roleColor}35` }}>
                  <Shield size={8} strokeWidth={1.5} style={{ color: roleColor }} />
                  <span className="uppercase tracking-widest" style={{ fontSize: "0.5rem", color: roleColor }}>
                    {roleLabel}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="w-full divide-y divide-white/[0.05] border border-white/[0.05]">
                {[
                  { label: "Контрактов",   val: contractCount },
                  { label: "Достижений",   val: achievementsEarned },
                  { label: "Дней в семье", val: days },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between px-4 py-2">
                    <span className="text-white/35 uppercase tracking-wider" style={{ fontSize: "0.56rem" }}>
                      {s.label}
                    </span>
                    <span className="text-[#9b2335]" style={{ fontSize: "0.85rem" }}>
                      {s.val}
                    </span>
                  </div>
                ))}
              </div>

              {/* Edit profile btn */}
              <button onClick={() => go("profile")}
                className="w-full py-2 border border-white/[0.08] text-white/30 hover:text-white/60 hover:border-white/15 transition-all uppercase tracking-wider"
                style={{ fontSize: "0.58rem" }}>
                Редактировать профиль
              </button>

              {/* Logout */}
              <button onClick={() => { logout(); navigate("/login"); }}
                className="w-full flex items-center justify-center gap-2 py-2 border border-white/[0.05] text-white/20 hover:text-[#ff3366]/60 hover:border-[#ff3366]/15 transition-all uppercase tracking-wider"
                style={{ fontSize: "0.56rem" }}>
                <LogOut size={11} strokeWidth={1.5} />
                Выйти
              </button>
            </div>
          </div>

          {/* ── Content ── */}
          <div className="flex-1 lg:ml-5 min-w-0">

            {/* Tabs strip */}
            <div className="border-b border-white/[0.07] flex overflow-x-auto no-scrollbar bg-[#0f0f18]/60 sticky top-[72px] z-30 backdrop-blur-md">

              {TABS.map(({ id, label }) => {
                const active = activeTab === id;
                const badge  = id === "contracts" && openContracts > 0 ? openContracts : null;
                return (
                  <button key={id} onClick={() => go(id)}
                    className={`relative flex items-center gap-1.5 px-4 py-3 shrink-0 uppercase tracking-wider transition-colors duration-150
                      ${active ? "text-white" : "text-white/28 hover:text-white/55"}`}
                    style={{ fontSize: "0.61rem" }}>
                    {label}
                    {badge && (
                      <span className="min-w-[16px] h-4 flex items-center justify-center rounded-full bg-[#9b2335] text-white"
                        style={{ fontSize: "0.44rem", padding: "0 3px" }}>{badge}</span>
                    )}
                    {active && (
                      <motion.div layoutId="cab-underline"
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#9b2335]" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab content */}
            <div className="py-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === "feed" && (
                    <CabinetFeed
                      notifications={cabinetData.notifications}
                      memberName={member?.name}
                      avatarUrl={currentAccount.avatarDataUrl}
                    />
                  )}
                  {activeTab === "profile" && (
                    <CabinetProfile account={currentAccount} updateAccount={updateAccount} />
                  )}
                  {activeTab === "upgrades" && (
                    <CabinetUpgrades upgrades={cabinetData.upgrades} />
                  )}
                  {activeTab === "infrastructure" && (
                    <CabinetInfrastructure infrastructure={cabinetData.infrastructure} />
                  )}
                  {activeTab === "vehicles" && (
                    <CabinetVehicles vehicles={cabinetData.vehicles} userRole={member?.role} />
                  )}
                  {activeTab === "contracts" && (
                    <CabinetContracts
                      contracts={cabinetData.contracts}
                      memberId={session.memberId}
                      memberName={member?.name}
                      onSignUp={cabinetData.signUpForContract}
                    />
                  )}
                  {activeTab === "achievements" && (
                    <CabinetAchievements
                      achievementDefs={cabinetData.achievementDefs}
                      userAchievements={cabinetData.userAchievements}
                      memberId={session.memberId}
                      contractCount={contractCount}
                    />
                  )}
                  {activeTab === "glossary" && <CabinetGlossary />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}