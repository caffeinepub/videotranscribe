import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import { AdminPanel } from "./components/AdminPanel";
import { BlockedScreen } from "./components/BlockedScreen";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";
import { RatingModal } from "./components/RatingModal";
import TranscribeApp from "./components/TranscribeApp";
import { UserRegistrationModal } from "./components/UserRegistrationModal";
import { useIsBlocked } from "./hooks/useQueries";

function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleOffline = () => {
      setIsOffline(true);
      setDismissed(false);
    };
    const handleOnline = () => {
      setIsOffline(false);
      setDismissed(false);
    };
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (!isOffline || dismissed) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: "#1a1a2e",
        borderBottom: "2px solid #6c63ff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        padding: "10px 16px",
        boxShadow: "0 2px 12px rgba(108,99,255,0.25)",
      }}
      data-ocid="app.error_state"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#6c63ff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        role="img"
        aria-label="No internet connection"
        style={{ flexShrink: 0 }}
      >
        <title>No internet connection</title>
        <path d="M1 6s4-4 11-4 11 4 11 4" />
        <path d="M5 10s3-3 7-3 7 3 7 3" />
        <line x1="12" y1="20" x2="12" y2="14" />
        <circle cx="12" cy="20" r="1" fill="#6c63ff" stroke="none" />
        <line x1="2" y1="2" x2="22" y2="22" stroke="#ff6b6b" strokeWidth="2" />
      </svg>
      <span
        style={{
          color: "#e0e0ff",
          fontSize: "14px",
          fontWeight: 500,
          flex: 1,
          textAlign: "center",
        }}
      >
        <span style={{ color: "#6c63ff", fontWeight: 700 }}>Internet</span>{" "}
        connection nahi hai. Please{" "}
        <span style={{ color: "#6c63ff" }}>Wi-Fi</span> ya{" "}
        <span style={{ color: "#6c63ff" }}>Mobile Data</span> on karein.
      </span>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "#888",
          fontSize: "18px",
          lineHeight: 1,
          padding: "2px 4px",
          flexShrink: 0,
        }}
        aria-label="Dismiss"
        data-ocid="app.close_button"
      >
        ✕
      </button>
    </div>
  );
}

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
      <OfflineBanner />
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
        <OfflineBanner />
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
