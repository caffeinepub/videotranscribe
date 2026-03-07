import { Download, Smartphone } from "lucide-react";
import { usePWAInstall } from "../hooks/usePWAInstall";
import { AndroidInstallModal } from "./AndroidInstallModal";
import { IOSInstallModal } from "./IOSInstallModal";

/**
 * Top banner that prompts users to install the app.
 * - Android: triggers native browser install prompt if available, else shows manual instructions
 * - iOS: opens step-by-step instruction modal
 * - Hides permanently once app is installed (standalone mode detected)
 */
export function PWAInstallPrompt() {
  const {
    canInstall,
    isInstalled,
    isIOS,
    hasNativePrompt,
    triggerInstall,
    showIOSModal,
    setShowIOSModal,
  } = usePWAInstall();

  // Already installed — never show anything
  if (isInstalled) return null;

  // Nothing to show
  if (!canInstall) return null;

  const label = isIOS ? "Add to Home Screen" : "Install App";
  const sublabel = isIOS
    ? "Install on your iPhone / iPad"
    : hasNativePrompt
      ? "Tap Install to add to your home screen"
      : "Add this app to your home screen";

  return (
    <>
      <div
        className="w-full bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border-b border-primary/40 px-4 py-3 flex items-center gap-3 z-50 shadow-md"
        role="banner"
        aria-label="Install app banner"
        data-ocid="pwa.panel"
      >
        {/* Icon */}
        <div className="shrink-0 w-9 h-9 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center">
          {isIOS ? (
            <Smartphone className="w-5 h-5 text-primary" />
          ) : (
            <Download className="w-5 h-5 text-primary" />
          )}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground leading-tight">
            {label}
          </p>
          <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
            {sublabel}
          </p>
        </div>

        {/* Install button */}
        <button
          type="button"
          onClick={triggerInstall}
          className="shrink-0 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 active:scale-95 transition-all shadow-sm"
          data-ocid="pwa.primary_button"
        >
          {isIOS ? "Add to Home Screen" : "Install App"}
        </button>
      </div>

      {/* iOS instruction modal */}
      <IOSInstallModal
        open={showIOSModal && isIOS}
        onClose={() => setShowIOSModal(false)}
      />

      {/* Android manual instruction modal (when native prompt not available) */}
      <AndroidInstallModal
        open={showIOSModal && !isIOS}
        onClose={() => setShowIOSModal(false)}
      />
    </>
  );
}
