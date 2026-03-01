export function Footer() {
  return (
    <footer className="border-t border-white/5 py-8 px-6">
      <div className="max-w-6xl mx-auto flex flex-col items-center gap-2">
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
