import { Button } from "@/components/ui/button";
import { ChevronDown, Plus, Share, X } from "lucide-react";

interface IOSInstallModalProps {
  open: boolean;
  onClose: () => void;
}

const steps = [
  {
    number: 1,
    icon: <Share className="w-5 h-5 text-primary" />,
    title: "Open in Safari",
    desc: "Make sure you're using Safari browser (not Chrome or Firefox).",
  },
  {
    number: 2,
    icon: (
      <div className="relative">
        <Share className="w-5 h-5 text-primary" />
      </div>
    ),
    title: "Tap the Share icon",
    desc: "At the bottom of Safari, tap the Share button (□ with an arrow pointing up).",
  },
  {
    number: 3,
    icon: <ChevronDown className="w-5 h-5 text-primary" />,
    title: '"Add to Home Screen"',
    desc: 'Scroll down in the share sheet and tap "Add to Home Screen".',
  },
  {
    number: 4,
    icon: <Plus className="w-5 h-5 text-primary" />,
    title: 'Tap "Add"',
    desc: 'In the top-right corner of the prompt, tap "Add" to confirm installation.',
  },
];

export function IOSInstallModal({ open, onClose }: IOSInstallModalProps) {
  if (!open) return null;

  return (
    // Backdrop wrapper (layout only, not semantic)
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      data-ocid="ios_install.dialog"
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
              <Share className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="font-display font-bold text-sm text-foreground leading-tight">
                Add to Home Screen
              </h2>
              <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                Install on your iPhone / iPad
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={onClose}
            aria-label="Close"
            data-ocid="ios_install.close_button"
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
              data-ocid={`ios_install.item.${index + 1}`}
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

          {/* Safari-only note */}
          <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25">
            <p className="text-xs text-amber-400 font-medium font-sans leading-relaxed">
              <span className="font-bold">Note:</span> "Add to Home Screen" only
              works in <span className="font-bold">Safari</span> on iPhone &amp;
              iPad. If you're using Chrome or another browser, switch to Safari
              first.
            </p>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="px-5 pb-6 pt-1">
          <Button
            className="w-full h-10 font-semibold"
            onClick={onClose}
            data-ocid="ios_install.confirm_button"
          >
            Got it!
          </Button>
        </div>
      </div>
    </div>
  );
}
