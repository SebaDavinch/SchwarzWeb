import { useParams } from "react-router";
import { motion } from "motion/react";
import { useAdminData } from "../hooks/useAdminData";

export function CustomPage() {
  const { slug } = useParams();
  const { visibleCustomPages } = useAdminData();

  const page = visibleCustomPages.find((p) => p.slug === slug);

  if (!page) {
    return (
      <div className="pt-16">
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1
              className="font-['Russo_One'] text-white/20"
              style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
            >
              404
            </h1>
            <p
              className="font-['Oswald'] text-white/15 tracking-wide mt-4"
              style={{ fontSize: "0.85rem" }}
            >
              Страница не найдена
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16">
      {/* Header */}
      <div className="relative h-[30vh] min-h-[200px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, ${page.headerGradient}08, transparent)`,
          }}
        />
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-['Russo_One'] text-white/20"
          style={{ fontSize: "clamp(2rem, 5vw, 4rem)", lineHeight: 1.1 }}
        >
          {page.title.split(" ").map((word, i, arr) =>
            i === arr.length - 1 ? (
              <span key={i} style={{ color: page.accentColor }}>
                {word}
              </span>
            ) : (
              <span key={i}>{word} </span>
            )
          )}
        </motion.h1>
      </div>

      {/* Content */}
      <section className="relative py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="font-['Oswald'] text-white/40 tracking-wide custom-page-content"
            style={{ fontSize: "0.88rem", lineHeight: 2 }}
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </div>
      </section>

      {/* Styling for custom page content */}
      <style>{`
        .custom-page-content h1,
        .custom-page-content h2,
        .custom-page-content h3 {
          font-family: 'Russo One', sans-serif;
          color: rgba(255,255,255,0.8);
          margin-top: 2rem;
          margin-bottom: 1rem;
        }
        .custom-page-content h1 { font-size: 2rem; }
        .custom-page-content h2 { font-size: 1.5rem; }
        .custom-page-content h3 { font-size: 1.2rem; }
        .custom-page-content p { margin-bottom: 1rem; }
        .custom-page-content a {
          color: ${page.accentColor};
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .custom-page-content ul, .custom-page-content ol {
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .custom-page-content li { margin-bottom: 0.5rem; }
        .custom-page-content img {
          max-width: 100%;
          border: 1px solid rgba(255,255,255,0.05);
          margin: 1rem 0;
        }
        .custom-page-content blockquote {
          border-left: 3px solid ${page.accentColor}40;
          padding-left: 1rem;
          color: rgba(255,255,255,0.3);
          font-style: italic;
          margin: 1.5rem 0;
        }
        .custom-page-content hr {
          border: none;
          border-top: 1px solid rgba(255,255,255,0.05);
          margin: 2rem 0;
        }
      `}</style>
    </div>
  );
}