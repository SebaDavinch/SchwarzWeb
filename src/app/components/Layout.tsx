import { Outlet } from "react-router";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { NewsTicker } from "./NewsTicker";
import { DynamicBackground } from "./DynamicBackground";

export function Layout() {
  return (
    <div className="min-h-screen text-white font-['Inter'] relative">
      <DynamicBackground />
      <div className="relative z-10">
        <Navbar />
        <NewsTicker />
        <main>
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}