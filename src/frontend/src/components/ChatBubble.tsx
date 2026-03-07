import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Check,
  Copy,
  Globe2,
  Loader2,
  MessageSquare,
  User,
} from "lucide-react";
import { useState } from "react";
import { LANGUAGES } from "./InputPanel";
import { WaveformIcon } from "./WaveformIcon";

// ── User Bubble ──────────────────────────────────────────────────────────────

interface UserBubbleProps {
  mode?: "video" | "chat";
  source?: string;
  targetLanguage?: string;
  chatInputText?: string;
}

export function UserBubble({
  mode = "video",
  source,
  targetLanguage,
  chatInputText,
}: UserBubbleProps) {
  if (mode === "chat") {
    return (
      <div className="flex justify-end animate-slide-up">
        <div className="flex items-end gap-2 max-w-[80%]">
          <div className="rounded-2xl rounded-br-sm px-4 py-3 bg-[oklch(0.22_0.04_270)] border border-[oklch(0.32_0.06_270)] shadow-card">
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="w-3 h-3 text-primary/70" />
              <span className="text-[10px] font-mono font-medium text-primary/70 uppercase tracking-wider">
                Chat Input
              </span>
            </div>
            <p className="text-sm font-sans text-foreground/90 leading-relaxed">
              {chatInputText}
            </p>
          </div>
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center mb-0.5">
            <User className="w-3.5 h-3.5 text-primary" />
          </div>
        </div>
      </div>
    );
  }

  const label = source || "";
  const isUrl = label.startsWith("http");

  return (
    <div className="flex justify-end animate-slide-up">
      <div className="flex items-end gap-2 max-w-[80%]">
        <div className="rounded-2xl rounded-br-sm px-4 py-3 bg-[oklch(0.22_0.04_270)] border border-[oklch(0.32_0.06_270)] shadow-card">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-medium text-primary/70 uppercase tracking-wider">
              {isUrl ? "URL" : "File"} → {targetLanguage}
            </span>
          </div>
          <p className="text-sm font-mono text-foreground/90 break-all leading-relaxed">
            {label}
          </p>
        </div>
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center mb-0.5">
          <User className="w-3.5 h-3.5 text-primary" />
        </div>
      </div>
    </div>
  );
}

// ── Copy Button ───────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground/60 hover:text-primary transition-colors"
      aria-label="Copy text"
    >
      {copied ? (
        <Check className="w-3 h-3 text-primary" />
      ) : (
        <Copy className="w-3 h-3" />
      )}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

// ── Text Section ─────────────────────────────────────────────────────────────

function TextSection({
  label,
  text,
  highlight = false,
}: {
  label: string;
  text: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span
          className={`text-[10px] font-mono uppercase tracking-wider ${
            highlight ? "text-primary/90" : "text-muted-foreground/70"
          }`}
        >
          {label}
        </span>
        <CopyButton text={text} />
      </div>
      <p
        className={`text-sm font-sans leading-relaxed whitespace-pre-wrap ${
          highlight ? "text-foreground" : "text-foreground/75"
        }`}
      >
        {text}
      </p>
    </div>
  );
}

// ── Assistant Bubble ──────────────────────────────────────────────────────────

interface AssistantBubbleProps {
  mode?: "video" | "chat";
  // video mode fields
  transcriptText?: string;
  englishText?: string;
  hinglishText?: string;
  detectedLanguage?: string;
  videoAltLanguage?: string;
  videoAltText?: string;
  videoAltLoading?: boolean;
  // chat mode fields
  chatInputText?: string;
  chatOutputText?: string;
  chatAltLanguage?: string;
  chatAltText?: string;
  onRequestAltTranslation?: (language: string) => void;
  onRequestVideoAltTranslation?: (language: string) => void;
  // shared
  isLoading?: boolean;
  errorMessage?: string;
}

export function AssistantBubble({
  mode = "video",
  transcriptText,
  englishText,
  hinglishText,
  detectedLanguage,
  videoAltLanguage,
  videoAltText,
  videoAltLoading,
  chatOutputText,
  chatAltLanguage,
  chatAltText,
  onRequestAltTranslation,
  onRequestVideoAltTranslation,
  isLoading,
  errorMessage,
}: AssistantBubbleProps) {
  return (
    <div className="flex justify-start animate-slide-up">
      <div className="flex items-end gap-2 max-w-[85%]">
        {/* Avatar */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[oklch(0.17_0.025_265)] border border-primary/40 flex items-center justify-center mb-0.5 shadow-glow-sm">
          <WaveformIcon className="text-primary" isAnimating={isLoading} />
        </div>

        <div className="rounded-2xl rounded-bl-sm px-4 py-3 bg-[oklch(0.17_0.025_265)] border border-[oklch(0.26_0.025_265)] shadow-card flex-1">
          {/* Loading state */}
          {isLoading && (
            <div
              data-ocid="transcribe.loading_state"
              className="flex items-center gap-3"
            >
              <div className="flex items-end gap-[3px] h-5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-1 rounded-full bg-primary wave-bar"
                    style={{
                      height: "100%",
                      animationDelay: `${(i - 1) * 0.12}s`,
                    }}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground font-sans animate-pulse">
                Processing…
              </span>
            </div>
          )}

          {/* Error state */}
          {errorMessage && (
            <div data-ocid="transcribe.error_state">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                <span className="text-xs font-mono font-medium text-destructive uppercase tracking-wider">
                  Error
                </span>
              </div>
              <p className="text-sm text-destructive/90 font-sans leading-relaxed">
                {errorMessage}
              </p>
            </div>
          )}

          {/* Video mode content */}
          {!isLoading &&
            !errorMessage &&
            mode === "video" &&
            transcriptText && (
              <div className="space-y-4">
                {/* Language badge */}
                {detectedLanguage && (
                  <div className="flex items-center gap-2">
                    <Globe2 className="w-3.5 h-3.5 text-primary/70" />
                    <span className="text-[10px] font-mono text-primary/80 uppercase tracking-wider">
                      {detectedLanguage === "image"
                        ? "📷 Image Text Extracted"
                        : `Detected: ${detectedLanguage}`}
                    </span>
                  </div>
                )}

                {/* 1. Original transcript / Extracted text */}
                <TextSection
                  label={
                    detectedLanguage === "image"
                      ? "Extracted Text"
                      : "Original Transcript"
                  }
                  text={transcriptText}
                />

                <div className="border-t border-border/60" />

                {/* 2. English translation */}
                {englishText && (
                  <>
                    <TextSection
                      label="English Translation"
                      text={englishText}
                      highlight
                    />
                    <div className="border-t border-border/60" />
                  </>
                )}

                {/* 3. Hinglish translation */}
                {hinglishText && (
                  <TextSection
                    label="Hinglish Translation"
                    text={hinglishText}
                    highlight
                  />
                )}

                {/* 4. Language selector — appears after all 3 outputs */}
                <div className="border-t border-primary/20 pt-4">
                  <div className="rounded-xl border border-primary/25 bg-primary/5 px-4 py-3 space-y-3">
                    <p className="text-[11px] font-sans text-muted-foreground/80 leading-relaxed flex items-center gap-1.5">
                      <Globe2 className="w-3.5 h-3.5 text-primary/60 shrink-0" />
                      Select the language in which you want the result
                    </p>

                    {/* Dropdown language selector */}
                    <Select
                      value={videoAltLanguage || ""}
                      onValueChange={(val) => {
                        if (
                          val &&
                          onRequestVideoAltTranslation &&
                          !videoAltLoading
                        ) {
                          onRequestVideoAltTranslation(val);
                        }
                      }}
                      disabled={videoAltLoading}
                    >
                      <SelectTrigger
                        className="w-full h-9 text-xs font-mono border-border/60 bg-muted/20 focus:ring-primary"
                        data-ocid="video.language_select"
                      >
                        <SelectValue placeholder="Choose language…" />
                      </SelectTrigger>
                      <SelectContent className="font-sans text-sm max-h-60">
                        {LANGUAGES.map((lang) => (
                          <SelectItem
                            key={lang.code}
                            value={lang.label}
                            className="text-xs font-mono cursor-pointer"
                          >
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Loading state for alt translation */}
                    {videoAltLoading && (
                      <div className="flex items-center gap-2 text-xs text-primary/70 font-mono animate-pulse">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Translating to {videoAltLanguage}…
                      </div>
                    )}

                    {/* Alt translation result */}
                    {!videoAltLoading && videoAltLanguage && videoAltText && (
                      <div className="border-t border-border/40 pt-3">
                        <TextSection
                          label={`${videoAltLanguage} Translation`}
                          text={videoAltText}
                          highlight
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          {/* Chat mode content */}
          {!isLoading && !errorMessage && mode === "chat" && chatOutputText && (
            <div className="space-y-4">
              {/* Hinglish output */}
              <TextSection
                label="Hinglish Translation"
                text={chatOutputText}
                highlight
              />

              {/* Alt language section */}
              {chatAltLanguage && chatAltText && (
                <>
                  <div className="border-t border-border/60" />
                  <TextSection
                    label={`${chatAltLanguage} Translation`}
                    text={chatAltText}
                    highlight
                  />
                </>
              )}

              {/* Language picker hint */}
              <div className="border-t border-border/40 pt-3 space-y-2">
                <p className="text-[11px] font-sans text-muted-foreground/70 italic">
                  If you want a response in another language, choose the
                  language:
                </p>
                <Select
                  value={chatAltLanguage || ""}
                  onValueChange={(val) => {
                    if (val && onRequestAltTranslation) {
                      onRequestAltTranslation(val);
                    }
                  }}
                >
                  <SelectTrigger
                    className="h-8 text-xs font-mono border-border/60 bg-muted/20 focus:ring-primary w-44"
                    data-ocid="chat.language_select"
                  >
                    <SelectValue placeholder="Choose language…" />
                  </SelectTrigger>
                  <SelectContent className="font-sans text-sm max-h-60">
                    {LANGUAGES.map((lang) => (
                      <SelectItem
                        key={lang.code}
                        value={lang.label}
                        className="text-xs font-mono cursor-pointer"
                      >
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
