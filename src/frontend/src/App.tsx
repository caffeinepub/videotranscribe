import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import { AdminPanel } from "./components/AdminPanel";
import { BlockedScreen } from "./components/BlockedScreen";
import { ComingSoonScreen } from "./components/ComingSoonScreen";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";
import { RatingModal } from "./components/RatingModal";
import TranscribeApp from "./components/TranscribeApp";
import { UserRegistrationModal } from "./components/UserRegistrationModal";
import { useActor } from "./hooks/useActor";
import { useGetMaintenanceMode, useIsBlocked } from "./hooks/useQueries";

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

const WAVE_BARS: { delay: string; height: string }[] = [
  { delay: "0s", height: "20px" },
  { delay: "0.15s", height: "28px" },
  { delay: "0.3s", height: "20px" },
  { delay: "0.45s", height: "28px" },
  { delay: "0.6s", height: "20px" },
];

function AppLoadingScreen() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "oklch(0.12 0.015 265)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "20px",
      }}
      data-ocid="app.loading_state"
    >
      {/* Animated logo */}
      <div
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "18px",
          background: "oklch(0.22 0.04 270 / 0.6)",
          border: "1.5px solid oklch(0.72 0.18 200 / 0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 32px oklch(0.72 0.18 200 / 0.25)",
          animation: "loadingPulse 2s ease-in-out infinite",
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="oklch(0.72 0.18 200)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <title>Loading</title>
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
      </div>

      {/* Waveform bars */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "5px",
          height: "28px",
        }}
      >
        {WAVE_BARS.map((bar) => (
          <div
            key={bar.delay}
            style={{
              width: "4px",
              borderRadius: "2px",
              background: "oklch(0.72 0.18 200)",
              animation: "waveBar 1.2s ease-in-out infinite",
              animationDelay: bar.delay,
              height: bar.height,
              opacity: 0.8,
            }}
          />
        ))}
      </div>

      <div style={{ textAlign: "center" }}>
        <p
          style={{
            color: "oklch(0.93 0.02 255)",
            fontSize: "15px",
            fontWeight: 600,
            margin: 0,
            letterSpacing: "0.01em",
          }}
        >
          Arabic Scholar Translator
        </p>
        <p
          style={{
            color: "oklch(0.55 0.03 255)",
            fontSize: "12px",
            margin: "4px 0 0",
            fontFamily: "monospace",
          }}
        >
          Loading...
        </p>
      </div>

      <style>{`
        @keyframes loadingPulse {
          0%, 100% { box-shadow: 0 0 20px oklch(0.72 0.18 200 / 0.2); }
          50% { box-shadow: 0 0 40px oklch(0.72 0.18 200 / 0.5); }
        }
        @keyframes waveBar {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1); }
        }
      `}</style>
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

  const { actor, isFetching: actorLoading } = useActor();

  const { data: maintenanceMode } = useGetMaintenanceMode();
  const { data: isBlocked } = useIsBlocked(userEmail);

  // Show proper loading screen while actor is initializing
  if (actorLoading || !actor) {
    return <AppLoadingScreen />;
  }

  // Maintenance mode check -- shown to all users before blocked check
  if (maintenanceMode) {
    return <ComingSoonScreen />;
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
