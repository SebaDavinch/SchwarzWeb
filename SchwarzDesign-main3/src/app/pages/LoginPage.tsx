import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Заполните все поля");
      return;
    }
    const ok = login(username.trim(), password);
    if (ok) {
      navigate("/cabinet");
    } else {
      setError("Неверный логин или пароль");
      setShake(true);
      setTimeout(() => setShake(false), 600);
      setTimeout(() => setError(""), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4 overflow-hidden relative">
      {/* Background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#9b2335]/4 blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-[#9b2335]/2 blur-[200px] rounded-full pointer-events-none" />

      {/* Decorative lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-5">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute h-px bg-gradient-to-r from-transparent via-[#9b2335] to-transparent"
            style={{ top: `${15 + i * 14}%`, left: 0, right: 0 }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm relative"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h1
              className="text-[#9b2335]"
              style={{
                fontFamily: "'Metal Mania', cursive",
                fontSize: "2rem",
                letterSpacing: "0.05em",
              }}
            >
              SCHWARZ FAMILY
            </h1>
            <div className="flex items-center justify-center gap-3 mt-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#9b2335]/20" />
              <p
                className="text-white/20 uppercase tracking-[0.4em]"
                style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.55rem" }}
              >
                Личный кабинет
              </p>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#9b2335]/20" />
            </div>
          </motion.div>
        </div>

        {/* Login card */}
        <motion.div
          animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="border border-white/8 bg-white/[0.02] backdrop-blur-sm p-8"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 flex items-center justify-center border border-[#9b2335]/20 bg-[#9b2335]/5">
              <Lock size={16} className="text-[#9b2335]/50" strokeWidth={1.5} />
            </div>
            <div>
              <p
                className="text-white uppercase tracking-wider"
                style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.85rem" }}
              >
                Авторизация
              </p>
              <p
                className="text-white/20 tracking-wide"
                style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.65rem" }}
              >
                Войдите в свой аккаунт
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label
                className="text-white/30 uppercase tracking-wider block mb-2"
                style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.58rem" }}
              >
                Логин
              </label>
              <div className="relative">
                <User
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20"
                  strokeWidth={1.5}
                />
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="madara.schwarz"
                  autoComplete="username"
                  className="w-full bg-[#0d0d15] border border-white/8 focus:border-[#9b2335]/30 text-white/80 pl-9 pr-4 py-2.5 outline-none transition-colors"
                  style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.85rem" }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                className="text-white/30 uppercase tracking-wider block mb-2"
                style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.58rem" }}
              >
                Пароль
              </label>
              <div className="relative">
                <Lock
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20"
                  strokeWidth={1.5}
                />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full bg-[#0d0d15] border border-white/8 focus:border-[#9b2335]/30 text-white/80 pl-9 pr-10 py-2.5 outline-none transition-colors"
                  style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.85rem" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-[#ff3366]/70 overflow-hidden"
                  style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.72rem" }}
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              type="submit"
              className="w-full py-3 bg-[#9b2335] hover:bg-[#b52a40] text-white uppercase tracking-widest transition-all duration-300 mt-2"
              style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.72rem" }}
            >
              Войти
            </button>
          </form>
        </motion.div>

        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-white/15 hover:text-white/35 transition-colors uppercase tracking-widest"
            style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.58rem" }}
          >
            ← Вернуться на сайт
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
