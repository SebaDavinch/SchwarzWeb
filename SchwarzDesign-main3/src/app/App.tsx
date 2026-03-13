import { useState, useCallback } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { GTALoadingScreen } from "./components/GTALoadingScreen";

export default function App() {
  const [showLoader, setShowLoader] = useState(() => {
    // Show only once per session
    if (sessionStorage.getItem("schwarz_loaded")) return false;
    return true;
  });

  const handleComplete = useCallback(() => {
    sessionStorage.setItem("schwarz_loaded", "1");
    setShowLoader(false);
  }, []);

  return (
    <>
      {showLoader && <GTALoadingScreen onComplete={handleComplete} />}
      {!showLoader && <RouterProvider router={router} />}
    </>
  );
}
