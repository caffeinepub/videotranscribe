import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

function generateId(): string {
  return crypto.randomUUID();
}
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Menu, Mic2, X } from "lucide-react";
import type { TranscriptionRecord } from "../backend.d";
import {
  useClearHistory,
  useDeleteTranscription,
  useGetAllTranscriptions,
  useSaveTranscription,
} from "../hooks/useQueries";
import {
  CorsError,
  FileTooLargeError,
  transcribeAndTranslate,
} from "../services/groq";
import { AssistantBubble, UserBubble } from "./ChatBubble";
import { HistorySidebar } from "./HistorySidebar";
import { InputPanel } from "./InputPanel";
import { WaveformIcon } from "./WaveformIcon";

interface ChatMessage {
  id: string;
  type: "user" | "assistant";
  source?: string;
  targetLanguage?: string;
  transcriptText?: string;
  translatedText?: string;
  detectedLanguage?: string;
  isLoading?: boolean;
  errorMessage?: string;
}

export default function TranscribeApp() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(
    null,
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const { data: historyRecords = [], isLoading: historyLoading } =
    useGetAllTranscriptions();
  const saveTranscription = useSaveTranscription();
  const deleteTranscription = useDeleteTranscription();
  const clearHistory = useClearHistory();

  // Scroll to bottom when messages change — intentionally only tracking length
  // biome-ignore lint/correctness/useExhaustiveDependencies: length-only dep is intentional
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSubmit = async (
    source: File | string,
    targetLanguage: string,
    targetLanguageCode: string,
  ) => {
    const msgId = generateId();
    const sourceName =
      source instanceof File ? source.name : (source as string);

    // Add user message
    const userMsg: ChatMessage = {
      id: `user-${msgId}`,
      type: "user",
      source: sourceName,
      targetLanguage,
    };

    // Add loading assistant message
    const assistantMsgId = `assistant-${msgId}`;
    const loadingMsg: ChatMessage = {
      id: assistantMsgId,
      type: "assistant",
      isLoading: true,
    };

    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setIsProcessing(true);
    setSelectedHistoryId(null);

    try {
      const result = await transcribeAndTranslate(
        source,
        targetLanguage,
        targetLanguageCode,
      );

      // Update assistant message with result
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                isLoading: false,
                transcriptText: result.transcriptText,
                translatedText: result.translatedText,
                detectedLanguage: result.detectedLanguage,
                targetLanguage,
              }
            : m,
        ),
      );

      // Save to backend (best-effort — don't fail the transcription if backend is unavailable)
      try {
        const recordId = generateId();
        const now = BigInt(Date.now()) * 1_000_000n; // nanoseconds
        await saveTranscription.mutateAsync({
          id: recordId,
          source: sourceName,
          languageSource: result.detectedLanguage,
          languageTarget: targetLanguageCode,
          transcriptText: result.transcriptText,
          translatedText: result.translatedText,
          timestamp: now,
        });
        toast.success("Transcription saved to history");
      } catch {
        // Backend unavailable — transcription still shown in chat
      }
    } catch (err) {
      const errorMessage =
        err instanceof FileTooLargeError
          ? err.message
          : err instanceof CorsError
            ? err.message
            : err instanceof Error
              ? err.message
              : "An unexpected error occurred. Please try again.";

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? { ...m, isLoading: false, errorMessage }
            : m,
        ),
      );

      toast.error("Processing failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectHistory = (record: TranscriptionRecord) => {
    setSelectedHistoryId(record.id);
    setSidebarOpen(false);

    // Load the selected record into chat view
    const userMsg: ChatMessage = {
      id: `user-history-${record.id}`,
      type: "user",
      source: record.source,
      targetLanguage: record.languageTarget,
    };
    const assistantMsg: ChatMessage = {
      id: `assistant-history-${record.id}`,
      type: "assistant",
      transcriptText: record.transcriptText,
      translatedText: record.translatedText,
      detectedLanguage: record.languageSource,
      targetLanguage: record.languageTarget,
    };
    setMessages([userMsg, assistantMsg]);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTranscription.mutateAsync(id);
      if (selectedHistoryId === id) {
        setSelectedHistoryId(null);
      }
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleClearAll = async () => {
    try {
      await clearHistory.mutateAsync();
      setMessages([]);
      setSelectedHistoryId(null);
      toast.success("History cleared");
    } catch {
      toast.error("Failed to clear history");
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Close sidebar"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape" || e.key === "Enter") setSidebarOpen(false);
          }}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 lg:z-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } flex flex-col`}
      >
        <div className="absolute top-3 right-3 lg:hidden z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="h-7 w-7"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="h-full">
          <HistorySidebar
            records={historyRecords}
            isLoading={historyLoading}
            selectedId={selectedHistoryId}
            onSelect={handleSelectHistory}
            onDelete={handleDelete}
            onClearAll={handleClearAll}
            isClearingAll={clearHistory.isPending}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="shrink-0 border-b border-border bg-background/80 backdrop-blur-md px-4 lg:px-6 h-14 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 lg:hidden shrink-0"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center shadow-glow-sm">
              <Mic2 className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="font-display font-bold text-base text-foreground leading-none">
                VideoTranscribe
              </h1>
              <p className="text-[10px] font-mono text-muted-foreground/70 mt-0.5 leading-none">
                AI-powered speech to text
              </p>
            </div>
          </div>

          {/* Status pill */}
          <div className="ml-auto flex items-center gap-2">
            {isProcessing && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                <WaveformIcon className="text-primary w-4 h-4" isAnimating />
                <span className="text-xs font-mono text-primary">
                  Processing
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Chat + Input area */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Chat area */}
          <div className="flex-1 overflow-hidden relative">
            {/* Background decoration */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div
                className="absolute top-0 left-0 right-0 h-64 opacity-30"
                style={{
                  backgroundImage:
                    "url(/assets/generated/waveform-bg.dim_1200x400.png)",
                  backgroundSize: "cover",
                  backgroundPosition: "center top",
                  maskImage:
                    "linear-gradient(to bottom, rgba(0,0,0,0.4), transparent)",
                  WebkitMaskImage:
                    "linear-gradient(to bottom, rgba(0,0,0,0.4), transparent)",
                }}
              />
            </div>

            <ScrollArea className="h-full">
              <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
                {!hasMessages ? (
                  // Empty state
                  <div className="flex flex-col items-center justify-center min-h-[50vh] text-center animate-slide-up">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5 shadow-glow">
                      <Mic2 className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="font-display font-bold text-2xl text-foreground mb-2">
                      Ready to transcribe
                    </h2>
                    <p className="text-sm text-muted-foreground max-w-sm font-sans leading-relaxed">
                      Upload a video or audio file — or paste a URL — and I'll
                      transcribe and translate the speech for you.
                    </p>
                    <div className="mt-6 grid grid-cols-3 gap-3">
                      {[
                        { label: "99+ Languages", sub: "Whisper AI" },
                        { label: "Auto-detect", sub: "Source language" },
                        { label: "Real-time", sub: "Chat style output" },
                      ].map((feat) => (
                        <div
                          key={feat.label}
                          className="px-3 py-2.5 rounded-xl border border-border/60 bg-card/40 text-center"
                        >
                          <p className="text-xs font-display font-semibold text-foreground">
                            {feat.label}
                          </p>
                          <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                            {feat.sub}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((msg) =>
                    msg.type === "user" ? (
                      <UserBubble
                        key={msg.id}
                        source={msg.source || ""}
                        targetLanguage={msg.targetLanguage || "English"}
                      />
                    ) : (
                      <AssistantBubble
                        key={msg.id}
                        transcriptText={msg.transcriptText}
                        translatedText={msg.translatedText}
                        detectedLanguage={msg.detectedLanguage}
                        targetLanguage={msg.targetLanguage}
                        isLoading={msg.isLoading}
                        errorMessage={msg.errorMessage}
                      />
                    ),
                  )
                )}
                <div ref={chatEndRef} />
              </div>
            </ScrollArea>
          </div>

          {/* Input panel */}
          <div className="shrink-0 border-t border-border/60 bg-background/90 backdrop-blur-md px-4 py-4">
            <div className="max-w-3xl mx-auto space-y-3">
              <InputPanel onSubmit={handleSubmit} isProcessing={isProcessing} />
              {/* Footer */}
              <p className="text-center text-[10px] text-muted-foreground/40 font-sans">
                © {new Date().getFullYear()}. Built with ♥ using{" "}
                <a
                  href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-muted-foreground transition-colors"
                >
                  caffeine.ai
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
