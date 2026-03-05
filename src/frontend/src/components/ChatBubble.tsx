import { Check, Copy, Globe2, User } from "lucide-react";
import { useState } from "react";
import { WaveformIcon } from "./WaveformIcon";

interface UserBubbleProps {
  source: string;
  targetLanguage: string;
}

interface AssistantBubbleProps {
  transcriptText?: string;
  translatedText?: string;
  detectedLanguage?: string;
  targetLanguage?: string;
  isLoading?: boolean;
  errorMessage?: string;
}

export function UserBubble({ source, targetLanguage }: UserBubbleProps) {
  const isUrl = source.startsWith("http");
  const label = isUrl ? source : source;

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

export function AssistantBubble({
  transcriptText,
  translatedText,
  detectedLanguage,
  targetLanguage,
  isLoading,
  errorMessage,
}: AssistantBubbleProps) {
  const [copiedTranscript, setCopiedTranscript] = useState(false);
  const [copiedTranslation, setCopiedTranslation] = useState(false);

  const handleCopy = async (
    text: string,
    type: "transcript" | "translation",
  ) => {
    await navigator.clipboard.writeText(text);
    if (type === "transcript") {
      setCopiedTranscript(true);
      setTimeout(() => setCopiedTranscript(false), 2000);
    } else {
      setCopiedTranslation(true);
      setTimeout(() => setCopiedTranslation(false), 2000);
    }
  };

  return (
    <div className="flex justify-start animate-slide-up">
      <div className="flex items-end gap-2 max-w-[85%]">
        {/* Avatar */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[oklch(0.17_0.025_265)] border border-primary/40 flex items-center justify-center mb-0.5 shadow-glow-sm">
          <WaveformIcon className="text-primary" isAnimating={isLoading} />
        </div>

        <div className="rounded-2xl rounded-bl-sm px-4 py-3 bg-[oklch(0.17_0.025_265)] border border-[oklch(0.26_0.025_265)] shadow-card flex-1">
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
                Processing audio…
              </span>
            </div>
          )}

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

          {!isLoading && !errorMessage && transcriptText && (
            <div className="space-y-4">
              {/* Detected language badge */}
              {detectedLanguage && (
                <div className="flex items-center gap-2">
                  <Globe2 className="w-3.5 h-3.5 text-primary/70" />
                  <span className="text-[10px] font-mono text-primary/80 uppercase tracking-wider">
                    Detected: {detectedLanguage}
                  </span>
                  {targetLanguage && (
                    <>
                      <span className="text-muted-foreground/40 text-[10px]">
                        →
                      </span>
                      <span className="text-[10px] font-mono text-primary uppercase tracking-wider">
                        {targetLanguage}
                      </span>
                    </>
                  )}
                </div>
              )}

              {/* Original transcript */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono text-muted-foreground/70 uppercase tracking-wider">
                    Original Transcript
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(transcriptText, "transcript")}
                    className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground/60 hover:text-primary transition-colors"
                    aria-label="Copy transcript"
                  >
                    {copiedTranscript ? (
                      <Check className="w-3 h-3 text-primary" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    {copiedTranscript ? "Copied!" : "Copy"}
                  </button>
                </div>
                <p className="text-sm font-sans text-foreground/75 leading-relaxed whitespace-pre-wrap">
                  {transcriptText}
                </p>
              </div>

              {/* Divider */}
              <div className="border-t border-border/60" />

              {/* Translation */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono text-primary/80 uppercase tracking-wider">
                    {targetLanguage} Translation
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(translatedText || "", "translation")
                    }
                    className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground/60 hover:text-primary transition-colors"
                    aria-label="Copy translation"
                  >
                    {copiedTranslation ? (
                      <Check className="w-3 h-3 text-primary" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    {copiedTranslation ? "Copied!" : "Copy"}
                  </button>
                </div>
                <p className="text-sm font-sans text-foreground leading-relaxed whitespace-pre-wrap">
                  {translatedText}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
