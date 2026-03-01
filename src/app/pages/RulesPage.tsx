import { RulesSection } from "../components/RulesSection";
import { GlitchText } from "../components/GlitchText";
import { EditablePageSection } from "../components/EditablePageSection";

export function RulesPage() {
  return (
    <div className="pt-16">
      <div className="relative h-[30vh] min-h-[200px] flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-[#ff3366]/5 via-transparent to-transparent" />
        <GlitchText
          as="h1"
          className="font-['Russo_One'] text-white relative z-10"
          style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: 1.1 }}
          text="Наш кодекс"
        >
          Наш <span className="text-[#ff3366]">кодекс</span>
        </GlitchText>
      </div>
      <RulesSection />
      <EditablePageSection pageId="rules" />
    </div>
  );
}