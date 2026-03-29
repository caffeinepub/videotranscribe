import { Mail, MessageCircle, ShieldX } from "lucide-react";

export function BlockedScreen() {
  const whatsappUrl =
    "https://wa.me/917838272313?text=Assalamualaikum%20Sayed%20Hamza%20I%20want%20some%20help%20regarding%20your%20application";
  const emailUrl =
    "mailto:sayedmohammadhamza45@gmail.com?subject=Request%20to%20Unblock%20-%20Arabic%20Scholar%20Translator";

  return (
    <div
      className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center"
      data-ocid="blocked.panel"
    >
      {/* Icon */}
      <div className="mb-8">
        <div className="w-24 h-24 rounded-full bg-destructive/10 border-2 border-destructive/30 flex items-center justify-center mx-auto mb-4">
          <ShieldX className="w-12 h-12 text-destructive" />
        </div>
      </div>

      {/* Main Message */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight mb-4 max-w-2xl">
        You have been blocked by the Admin.
      </h1>

      <p className="text-lg text-muted-foreground mb-10 max-w-md">
        Your access to Arabic Scholar Translator has been restricted. Please
        contact the admin to resolve this issue.
      </p>

      {/* Divider */}
      <div className="w-16 h-px bg-border mb-8" />

      {/* Contact Section */}
      <div className="w-full max-w-sm">
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-5">
          Contact the Admin for assistance
        </p>

        <div className="space-y-3">
          {/* Email */}
          <a
            href={emailUrl}
            className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/40 hover:bg-primary/5 transition-all group"
            data-ocid="blocked.link"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="text-xs text-muted-foreground font-medium mb-0.5">
                Email
              </p>
              <p className="text-sm text-foreground font-semibold">
                sayedmohammadhamza45@gmail.com
              </p>
            </div>
          </a>

          {/* WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-green-500/40 hover:bg-green-500/5 transition-all group"
            data-ocid="blocked.secondary_button"
          >
            <div className="w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0 group-hover:bg-green-500/15 transition-colors">
              <MessageCircle className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-left">
              <p className="text-xs text-muted-foreground font-medium mb-0.5">
                WhatsApp
              </p>
              <p className="text-sm text-foreground font-semibold">
                +91 7838272313
              </p>
            </div>
          </a>
        </div>
      </div>

      {/* Footer */}
      <p className="mt-12 text-xs text-muted-foreground/50">
        Arabic Scholar Translator — Made by Sayed Hamza Salafi 💙
      </p>
    </div>
  );
}
