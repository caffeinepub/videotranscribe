import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Don't show if already installed (standalone mode)
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)",
    ).matches;
    if (isStandalone) return;

    // Don't show if previously dismissed
    const dismissed = localStorage.getItem("ast_pwa_dismissed");
    if (dismissed) return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setShowBanner(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("ast_pwa_dismissed", "true");
  };

  if (!showBanner) return null;

  return (
    <div
      className="w-full bg-card border-b border-primary/30 px-4 py-2.5 flex items-center gap-3 z-50 shadow-md"
      role="banner"
      aria-label="Install app banner"
      data-ocid="pwa.panel"
    >
      {/* Icon */}
      <div className="shrink-0 w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
        <Download className="w-4 h-4 text-primary" />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-foreground leading-tight truncate">
          Install Arabic Scholar Translator
        </p>
        <p className="text-[10px] text-muted-foreground leading-tight">
          Add to your home screen for quick access
        </p>
      </div>

      {/* Install button */}
      <button
        type="button"
        onClick={handleInstall}
        className="shrink-0 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 active:scale-95 transition-all"
        data-ocid="pwa.primary_button"
      >
        Add to Home Screen
      </button>

      {/* Dismiss */}
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss install prompt"
        className="shrink-0 w-6 h-6 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 flex items-center justify-center transition-colors"
        data-ocid="pwa.close_button"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
