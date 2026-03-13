import { createBrowserRouter, Outlet } from "react-router";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { AboutPage } from "./pages/AboutPage";
import { MembersPage } from "./pages/MembersPage";
import { RulesPage } from "./pages/RulesPage";
import { HistoryPage } from "./pages/HistoryPage";
import { MediaPage } from "./pages/MediaPage";
import { HowToPlayPage } from "./pages/HowToPlayPage";
import { JoinFamilyPage } from "./pages/JoinFamilyPage";
import { ReduxPage } from "./pages/ReduxPage";
import { CurrentLeadershipPage } from "./pages/CurrentLeadershipPage";
import { PollsPage } from "./pages/PollsPage";
import { AdminPage } from "./pages/AdminPage";
import { CustomPage } from "./pages/CustomPage";
import { SchwarzNewsPage } from "./pages/SchwarzNewsPage";
import { NewsArticlePage } from "./pages/NewsArticlePage";
import { MomentsPage } from "./pages/MomentsPage";
import { LoginPage } from "./pages/LoginPage";
import { CabinetPage } from "./pages/CabinetPage";
import { StatsPage } from "./pages/StatsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Outlet,
    children: [
      {
        Component: Layout,
        children: [
          { index: true, Component: HomePage },
          { path: "about", Component: AboutPage },
          { path: "history", Component: HistoryPage },
          { path: "current-leadership", Component: CurrentLeadershipPage },
          { path: "media", Component: MediaPage },
          { path: "members", Component: MembersPage },
          { path: "family-tree", Component: MembersPage },
          { path: "redux", Component: ReduxPage },
          { path: "rules", Component: RulesPage },
          { path: "how-to-play", Component: HowToPlayPage },
          { path: "join", Component: JoinFamilyPage },
          { path: "polls", Component: PollsPage },
          { path: "news", Component: SchwarzNewsPage },
          { path: "news/:id", Component: NewsArticlePage },
          { path: "moments", Component: MomentsPage },
          { path: "page/:slug", Component: CustomPage },
          { path: "stats", Component: StatsPage },
        ],
      },
      {
        path: "admin",
        Component: AdminPage,
      },
      {
        path: "login",
        Component: LoginPage,
      },
      {
        path: "cabinet",
        Component: CabinetPage,
      },
    ],
  },
]);