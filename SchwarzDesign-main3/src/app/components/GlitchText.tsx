import { useRef, useEffect, type CSSProperties, type ReactNode } from "react";

/**
 * GlitchText — wraps any heading text with a cyberpunk glitch-on-hover effect.
 * Uses CSS keyframes injected once into <head>.
 *
 * Usage:
 *   <GlitchText as="h1" className="..." style={...}>
 *     My <span className="text-green">Title</span>
 *   </GlitchText>
 */

let stylesInjected = false;

function injectGlitchStyles() {
  if (stylesInjected) return;
  stylesInjected = true;

  const css = `
    @keyframes glitch-anim-1 {
      0%   { clip-path: inset(20% 0 60% 0); transform: translate(-3px, 2px); }
      10%  { clip-path: inset(50% 0 20% 0); transform: translate(3px, -1px); }
      20%  { clip-path: inset(10% 0 70% 0); transform: translate(-2px, 3px); }
      30%  { clip-path: inset(80% 0 5% 0);  transform: translate(2px, -2px); }
      40%  { clip-path: inset(30% 0 40% 0); transform: translate(-3px, 1px); }
      50%  { clip-path: inset(60% 0 20% 0); transform: translate(1px, -3px); }
      60%  { clip-path: inset(15% 0 65% 0); transform: translate(-1px, 2px); }
      70%  { clip-path: inset(45% 0 35% 0); transform: translate(3px, 1px); }
      80%  { clip-path: inset(70% 0 10% 0); transform: translate(-2px, -1px); }
      90%  { clip-path: inset(5% 0 80% 0);  transform: translate(2px, 3px); }
      100% { clip-path: inset(25% 0 55% 0); transform: translate(-1px, -2px); }
    }
    @keyframes glitch-anim-2 {
      0%   { clip-path: inset(60% 0 10% 0); transform: translate(3px, -2px); }
      10%  { clip-path: inset(10% 0 70% 0); transform: translate(-2px, 1px); }
      20%  { clip-path: inset(40% 0 30% 0); transform: translate(2px, -3px); }
      30%  { clip-path: inset(70% 0 15% 0); transform: translate(-3px, 2px); }
      40%  { clip-path: inset(20% 0 50% 0); transform: translate(1px, -1px); }
      50%  { clip-path: inset(55% 0 25% 0); transform: translate(-1px, 3px); }
      60%  { clip-path: inset(5% 0 75% 0);  transform: translate(3px, -2px); }
      70%  { clip-path: inset(35% 0 45% 0); transform: translate(-2px, 1px); }
      80%  { clip-path: inset(65% 0 20% 0); transform: translate(1px, -3px); }
      90%  { clip-path: inset(15% 0 60% 0); transform: translate(-3px, 2px); }
      100% { clip-path: inset(50% 0 30% 0); transform: translate(2px, -1px); }
    }
    @keyframes glitch-skew {
      0%   { transform: skew(0deg); }
      20%  { transform: skew(-1deg); }
      40%  { transform: skew(0.5deg); }
      60%  { transform: skew(-0.5deg); }
      80%  { transform: skew(1deg); }
      100% { transform: skew(0deg); }
    }
    .glitch-wrap {
      position: relative;
      display: inline-block;
    }
    .glitch-wrap:hover {
      animation: glitch-skew 0.4s ease-in-out;
    }
    .glitch-wrap::before,
    .glitch-wrap::after {
      content: attr(data-text);
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      opacity: 0;
      overflow: hidden;
    }
    .glitch-wrap:hover::before {
      opacity: 0.8;
      color: #9b2335;
      text-shadow: -2px 0 #ff3366;
      animation: glitch-anim-1 0.3s linear infinite alternate-reverse;
    }
    .glitch-wrap:hover::after {
      opacity: 0.8;
      color: #ff3366;
      text-shadow: 2px 0 #9b2335;
      animation: glitch-anim-2 0.3s linear infinite alternate-reverse;
    }
  `;

  const style = document.createElement("style");
  style.setAttribute("data-glitch", "true");
  style.textContent = css;
  document.head.appendChild(style);
}

interface GlitchTextProps {
  children: ReactNode;
  as?: "h1" | "h2" | "h3" | "span" | "p" | "div";
  className?: string;
  style?: CSSProperties;
  /** Plain text for the pseudo-element content (data-text). If not provided, tries to extract from children. */
  text?: string;
}

function extractText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (node && typeof node === "object" && "props" in node) {
    return extractText((node as any).props.children);
  }
  return "";
}

export function GlitchText({
  children,
  as: Tag = "h1",
  className = "",
  style,
  text,
}: GlitchTextProps) {
  useEffect(() => {
    injectGlitchStyles();
  }, []);

  const dataText = text || extractText(children);

  return (
    <Tag
      className={`glitch-wrap ${className}`}
      style={style}
      data-text={dataText}
    >
      {children}
    </Tag>
  );
}