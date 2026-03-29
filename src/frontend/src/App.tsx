import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import { AdminPanel } from "./components/AdminPanel";
import { BlockedScreen } from "./components/BlockedScreen";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";
import { RatingModal } from "./components/RatingModal";
import TranscribeApp from "./components/TranscribeApp";
import { UserRegistrationModal } from "./components/UserRegistrationModal";
import { useIsBlocked } from "./hooks/useQueries";

function MainApp() {
  const [showRegistration, setShowRegistration] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const registered = localStorage.getItem("ast_user_registered");
    if (!registered) {
      setShowRegistration(true);
    } else {
      try {
        const info = JSON.parse(localStorage.getItem("ast_user_info") ?? "{}");
        if (info.email) setUserEmail(info.email);
      } catch {
        // ignore
      }
    }
  }, []);

  const { data: isBlocked, isLoading: checkingBlock } = useIsBlocked(userEmail);

  // While checking block status (and email is known), show nothing to avoid flash
  if (userEmail && checkingBlock) {
    return (
      <div
        className="min-h-screen bg-background"
        data-ocid="app.loading_state"
      />
    );
  }

  if (isBlocked) {
    return <BlockedScreen />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PWAInstallPrompt />
      {showRegistration && (
        <UserRegistrationModal
          onComplete={() => {
            setShowRegistration(false);
            try {
              const info = JSON.parse(
                localStorage.getItem("ast_user_info") ?? "{}",
              );
              if (info.email) setUserEmail(info.email);
            } catch {
              // ignore
            }
          }}
        />
      )}
      <TranscribeApp />
      <RatingModal />
      <Toaster
        theme="dark"
        toastOptions={{
          style: {
            background: "oklch(0.18 0.02 265)",
            border: "1px solid oklch(0.28 0.025 265)",
            color: "oklch(0.93 0.02 255)",
          },
        }}
      />
    </div>
  );
}

export default function App() {
  const isAdminRoute = window.location.pathname === "/admin";

  if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-background">
        <AdminPanel />
        <Toaster
          theme="dark"
          toastOptions={{
            style: {
              background: "oklch(0.18 0.02 265)",
              border: "1px solid oklch(0.28 0.025 265)",
              color: "oklch(0.93 0.02 255)",
            },
          }}
        />
      </div>
    );
  }

  return <MainApp />;
}
