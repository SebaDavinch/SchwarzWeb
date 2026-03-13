import { MessageCircle, Music, Send } from "lucide-react";

const contacts = [
  {
    icon: MessageCircle,
    label: "Discord",
    value: "discord.gg/schwarzfamq",
    href: "https://discord.gg/schwarzfamq",
  },
  {
    icon: Music,
    label: "TikTok",
    value: "@nebesnyin",
    href: "https://www.tiktok.com/@nebesnyin",
  },
  {
    icon: Send,
    label: "Telegram",
    value: "@nebesnyioff",
    href: "https://t.me/nebesnyioff",
  },
];

export function Footer() {
  return (
    <footer className="border-t border-white/5 py-10 px-6">
      <div className="max-w-6xl mx-auto flex flex-col items-center gap-5">
        {/* Contact links */}
        <div className="flex flex-wrap items-center justify-center gap-5">
          {contacts.map((c, i) => (
            <span key={c.label} className="flex items-center gap-2">
              <a
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-['Oswald'] text-white/25 hover:text-[#9b2335]/70 uppercase tracking-[0.15em] transition-colors duration-300"
                style={{ fontSize: "0.65rem" }}
              >
                <c.icon size={12} className="opacity-50" />
                {c.label}
              </a>
              {i < contacts.length - 1 && (
                <span className="text-white/10 ml-3">·</span>
              )}
            </span>
          ))}
        </div>

        <span
          className="font-['Oswald'] text-white/25 uppercase tracking-[0.2em]"
          style={{ fontSize: "0.7rem" }}
        >
          Schwarz Family &copy; 2026
        </span>
        <p
          className="font-['Oswald'] text-white/15 tracking-wider"
          style={{ fontSize: "0.6rem" }}
        >
          Designed by{" "}
          <a
            href="https://twitch.tv/sebadavinch"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#ff3366]/40 hover:text-[#ff3366]/70 transition-colors duration-300"
          >
            Sebastian Schwarz
          </a>
        </p>
      </div>
    </footer>
  );
}
