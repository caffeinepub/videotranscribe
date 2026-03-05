import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import { AdminPanel } from "./components/AdminPanel";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";
import { RatingModal } from "./components/RatingModal";
import TranscribeApp from "./components/TranscribeApp";
import { UserRegistrationModal } from "./components/UserRegistrationModal";

export default function App() {
  const isAdminRoute = window.location.pathname === "/admin";
  const [showRegistration, setShowRegistration] = useState(false);

  useEffect(() => {
    if (!isAdminRoute) {
      const registered = localStorage.getItem("ast_user_registered");
      if (!registered) {
        setShowRegistration(true);
      }
    }
  }, [isAdminRoute]);

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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PWAInstallPrompt />
      {showRegistration && (
        <UserRegistrationModal onComplete={() => setShowRegistration(false)} />
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
