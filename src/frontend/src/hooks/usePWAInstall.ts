import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const INSTALLED_KEY = "ast_pwa_installed";

function detectIsIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return (
    /iPad|iPhone|iPod/.test(ua) && !(window as { MSStream?: unknown }).MSStream
  );
}

function detectIsStandalone(): boolean {
  if (typeof window === "undefined") return false;
  // Standard PWA standalone detection
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  // iOS Safari standalone
  if ((navigator as { standalone?: boolean }).standalone === true) return true;
  // Persisted flag — set after Android user accepts install prompt
  if (localStorage.getItem(INSTALLED_KEY) === "true") return true;
  return false;
}

export interface PWAInstallState {
  canInstall: boolean;
  isIOS: boolean;
  isInstalled: boolean;
  hasNativePrompt: boolean;
  triggerInstall: () => Promise<void>;
  showIOSModal: boolean;
  setShowIOSModal: (show: boolean) => void;
}

export function usePWAInstall(): PWAInstallState {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(detectIsStandalone);
  const [showIOSModal, setShowIOSModal] = useState(false);

  const isIOS = detectIsIOS();

  useEffect(() => {
    // Watch for standalone mode changes (e.g. after install on Android)
    const mql = window.matchMedia("(display-mode: standalone)");
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsInstalled(true);
        localStorage.setItem(INSTALLED_KEY, "true");
      }
    };
    mql.addEventListener("change", handleChange);

    // Listen for Android beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // Listen for successful app install
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      localStorage.setItem(INSTALLED_KEY, "true");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      mql.removeEventListener("change", handleChange);
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const triggerInstall = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }
    if (deferredPrompt) {
      // Native Android install prompt — use it
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setIsInstalled(true);
        setDeferredPrompt(null);
        localStorage.setItem(INSTALLED_KEY, "true");
      }
    } else {
      // Fallback for Android Chrome when native prompt not yet ready:
      // Show manual "Add to Home Screen" instructions modal
      setShowIOSModal(true);
    }
  };

  // canInstall:
  // - Never show if already installed (standalone mode)
  // - Always show for iOS (instruction modal)
  // - Always show for Android (native prompt OR manual fallback)
  const canInstall = !isInstalled;

  const hasNativePrompt = deferredPrompt !== null;

  return {
    canInstall,
    isIOS,
    isInstalled,
    hasNativePrompt,
    triggerInstall,
    showIOSModal,
    setShowIOSModal,
  };
}
