import { Button } from "@/components/ui/button";
import { Chrome, Download, MoreVertical, Plus, X } from "lucide-react";

interface AndroidInstallModalProps {
  open: boolean;
  onClose: () => void;
}

const steps = [
  {
    number: 1,
    icon: <Chrome className="w-5 h-5 text-primary" />,
    title: "Open in Chrome",
    desc: "Make sure you are using Google Chrome browser on your Android phone.",
  },
  {
    number: 2,
    icon: <MoreVertical className="w-5 h-5 text-primary" />,
    title: "Tap the 3-dot menu",
    desc: "Tap the three dots (⋮) at the top-right corner of Chrome.",
  },
  {
    number: 3,
    icon: <Plus className="w-5 h-5 text-primary" />,
    title: '"Add to Home Screen"',
    desc: 'In the menu, tap "Add to Home screen" or "Install app".',
  },
  {
    number: 4,
    icon: <Download className="w-5 h-5 text-primary" />,
    title: 'Tap "Add" or "Install"',
    desc: 'Confirm by tapping "Add" or "Install". The app icon will appear on your home screen.',
  },
];

export function AndroidInstallModal({
  open,
  onClose,
}: AndroidInstallModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      data-ocid="android_install.dialog"
    >
      {/* Clickable overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        role="button"
        tabIndex={-1}
        aria-label="Close"
        onKeyDown={(e) => {
          if (e.key === "Escape" || e.key === "Enter") onClose();
        }}
      />

      {/* Sheet */}
      <div className="relative z-10 w-full max-w-md mx-auto bg-card border border-border rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden">
        {/* Handle bar (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Download className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="font-display font-bold text-sm text-foreground leading-tight">
                Install App on Android
              </h2>
              <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                Add to your home screen in 4 steps
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={onClose}
            aria-label="Close"
            data-ocid="android_install.close_button"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Steps */}
        <div className="px-5 py-4 space-y-3">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="flex items-start gap-3.5"
              data-ocid={`android_install.item.${index + 1}`}
            >
              {/* Step number circle */}
              <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 border border-primary/25 flex items-center justify-center mt-0.5">
                <span className="text-xs font-bold font-mono text-primary">
                  {step.number}
                </span>
              </div>
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  {step.icon}
                  <p className="text-sm font-semibold text-foreground font-sans">
                    {step.title}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground font-sans leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}

          {/* Chrome-only note */}
          <div className="mt-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/25">
            <p className="text-xs text-blue-400 font-medium font-sans leading-relaxed">
              <span className="font-bold">Note:</span> "Add to Home Screen"
              works best in <span className="font-bold">Google Chrome</span> on
              Android. If you are using another browser, switch to Chrome for
              the best experience.
            </p>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="px-5 pb-6 pt-1">
          <Button
            className="w-full h-10 font-semibold"
            onClick={onClose}
            data-ocid="android_install.confirm_button"
          >
            Got it!
          </Button>
        </div>
      </div>
    </div>
  );
}
