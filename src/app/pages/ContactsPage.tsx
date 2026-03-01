import { ContactsSection } from "../components/ContactsSection";
import { GlitchText } from "../components/GlitchText";
import { EditablePageSection } from "../components/EditablePageSection";

export function ContactsPage() {
  return (
    <div className="pt-16">
      <div className="relative h-[30vh] min-h-[200px] flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-[#9b2335]/5 via-transparent to-transparent" />
        <GlitchText
          as="h1"
          className="font-['Russo_One'] text-white relative z-10"
          style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: 1.1 }}
          text="Связаться с нами"
        >
          Связаться <span className="text-[#9b2335]">с нами</span>
        </GlitchText>
      </div>
      <ContactsSection />
      <EditablePageSection pageId="contacts" />
    </div>
  );
}