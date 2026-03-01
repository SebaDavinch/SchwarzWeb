import { HeroSection } from "../components/HeroSection";
import { AboutSection } from "../components/AboutSection";
import { NewsSection } from "../components/NewsSection";
import { TwitchLiveCard } from "../components/TwitchLiveStatus";
import { EditablePageSection } from "../components/EditablePageSection";

export function HomePage() {
  return (
    <>
      <HeroSection />
      <TwitchLiveCard />
      <AboutSection />
      <NewsSection />
      <EditablePageSection pageId="home" />
    </>
  );
}