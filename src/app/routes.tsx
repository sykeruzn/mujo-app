import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { MoodTracker } from "./pages/MoodTracker";
import { Analytics } from "./pages/Analytics";
import { LiveTracking } from "./pages/LiveTracking";
import { Auth } from "./pages/Auth";
import { Habits } from "./pages/Habits";
import { Entries } from "./pages/Entries";
import { RequireAuth } from "./components/RequireAuth";

export const router = createBrowserRouter([
  { path: "/auth", Component: Auth },
  {
    path: "/",
    element: <RequireAuth><Layout /></RequireAuth>,
    children: [
      { index: true, Component: MoodTracker },
      { path: "entries", Component: Entries },
      { path: "moods", Component: Analytics },
      { path: "mirror", Component: LiveTracking },
      { path: "habits", Component: Habits },
    ],
  },
]);