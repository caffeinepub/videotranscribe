import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

function generateId(): string {
  return crypto.randomUUID();
}
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, Home, Menu, Mic2, Smartphone, X } from "lucide-react";
import { ExternalBlob } from "../backend";
import type { TranscriptionRecord } from "../backend.d";
import { usePWAInstall } from "../hooks/usePWAInstall";
import {
  useClearHistory,
  useDeleteTranscription,
  useGetAllTranscriptions,
  useSaveTranscription,
  useSaveUserActivity,
  useSaveVideoRecord,
} from "../hooks/useQueries";
import {
  CorsError,
  FileTooLargeError,
  transcribeAndTranslate,
  transcribeImageAndTranslate,
  translateText,
} from "../services/groq";
import { AssistantBubble, UserBubble } from "./ChatBubble";
import { HistorySidebar } from "./HistorySidebar";
import { IOSInstallModal } from "./IOSInstallModal";
import { InputPanel } from "./InputPanel";
import { WaveformIcon } from "./WaveformIcon";

interface ChatMessage {
  id: string;
  type: "user" | "assistant";
  mode?: "video" | "chat";
  // video mode
  source?: string;
  transcriptText?: string;
  englishText?: string;
  hinglishText?: string;
  detectedLanguage?: string;
  videoAltLanguage?: string;
  videoAltText?: string;
  videoAltLoading?: boolean;
  // chat mode
  chatInputText?: string;
  chatOutputText?: string;
  chatAltLanguage?: string;
  chatAltText?: string;
  // shared
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

  // PWA install state
  const {
    canInstall,
    isInstalled,
    isIOS,
    triggerInstall,
    showIOSModal,
    setShowIOSModal,
  } = usePWAInstall();

  const { data: historyRecords = [], isLoading: historyLoading } =
    useGetAllTranscriptions();
  const saveTranscription = useSaveTranscription();
  const saveUserActivity = useSaveUserActivity();
  const saveVideoRecord = useSaveVideoRecord();
  const deleteTranscription = useDeleteTranscription();
  const clearHistory = useClearHistory();

  // Scroll to bottom when messages change — intentionally only tracking length
  // biome-ignore lint/correctness/useExhaustiveDependencies: length-only dep is intentional
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // ── Video / URL submit ──────────────────────────────────────────────────────
  const handleSubmit = async (
    source: File | string,
    targetLanguage: string,
    targetLanguageCode: string,
  ) => {
    const msgId = generateId();
    const sourceName =
      source instanceof File ? source.name : (source as string);

    const userMsg: ChatMessage = {
      id: `user-${msgId}`,
      type: "user",
      mode: "video",
      source: sourceName,
    };

    const assistantMsgId = `assistant-${msgId}`;
    const loadingMsg: ChatMessage = {
      id: assistantMsgId,
      type: "assistant",
      mode: "video",
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

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                isLoading: false,
                mode: "video" as const,
                transcriptText: result.transcriptText,
                englishText: result.englishText,
                hinglishText: result.hinglishText,
                detectedLanguage: result.detectedLanguage,
              }
            : m,
        ),
      );

      // Save to backend (best-effort)
      try {
        const recordId = generateId();
        const now = BigInt(Date.now()) * 1_000_000n; // nanoseconds
        await saveTranscription.mutateAsync({
          id: recordId,
          source: sourceName,
          languageSource: result.detectedLanguage,
          languageTarget: "en",
          transcriptText: result.transcriptText,
          translatedText: result.englishText,
          timestamp: now,
        });
        toast.success("Transcription saved to history");
      } catch {
        // Backend unavailable — transcription still shown in chat
      }

      // Upload video to blob storage (best-effort, only for File sources)
      if (source instanceof File) {
        try {
          const bytes = new Uint8Array(await source.arrayBuffer());
          const externalBlob = ExternalBlob.fromBytes(bytes);
          const uploaderName = localStorage.getItem("ast_user_name") ?? "";
          const uploaderEmail = localStorage.getItem("ast_user_email") ?? "";
          await saveVideoRecord.mutateAsync({
            id: generateId(),
            fileName: source.name,
            blob: externalBlob,
            uploaderName,
            uploaderEmail,
            timestamp: BigInt(Date.now()) * 1_000_000n,
          });
        } catch {
          // Silently ignore video upload failures — don't block the user
        }
      }

      // Save user activity (best-effort)
      try {
        const userId = localStorage.getItem("ast_user_id") ?? "";
        const userName = localStorage.getItem("ast_user_name") ?? "";
        const userEmail = localStorage.getItem("ast_user_email") ?? "";
        await saveUserActivity.mutateAsync({
          id: generateId(),
          userId,
          userName,
          userEmail,
          activityType: "video",
          inputText: result.transcriptText,
          outputText: result.englishText,
          sourceFile: sourceName,
          detectedLanguage: result.detectedLanguage,
          timestamp: BigInt(Date.now()) * 1_000_000n,
        });
      } catch {
        // Silently ignore activity save failures
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

  // ── Chat text submit ────────────────────────────────────────────────────────
  const handleChatSubmit = async (text: string) => {
    const msgId = generateId();

    const userMsg: ChatMessage = {
      id: `user-chat-${msgId}`,
      type: "user",
      mode: "chat",
      chatInputText: text,
    };

    const assistantMsgId = `assistant-chat-${msgId}`;
    const loadingMsg: ChatMessage = {
      id: assistantMsgId,
      type: "assistant",
      mode: "chat",
      isLoading: true,
    };

    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setIsProcessing(true);

    try {
      const hinglishOutput = await translateText(text, "Hinglish");

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                isLoading: false,
                mode: "chat" as const,
                chatInputText: text,
                chatOutputText: hinglishOutput,
              }
            : m,
        ),
      );

      // Save user activity (best-effort)
      try {
        const userId = localStorage.getItem("ast_user_id") ?? "";
        const userName = localStorage.getItem("ast_user_name") ?? "";
        const userEmail = localStorage.getItem("ast_user_email") ?? "";
        await saveUserActivity.mutateAsync({
          id: generateId(),
          userId,
          userName,
          userEmail,
          activityType: "chat",
          inputText: text,
          outputText: hinglishOutput,
          sourceFile: "",
          detectedLanguage: "",
          timestamp: BigInt(Date.now()) * 1_000_000n,
        });
      } catch {
        // Silently ignore activity save failures
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again.";

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? { ...m, isLoading: false, errorMessage }
            : m,
        ),
      );

      toast.error("Translation failed");
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Photo / image submit ────────────────────────────────────────────────────
  const handlePhotoSubmit = async (file: File) => {
    const msgId = generateId();
    const sourceName = file.name;

    const userMsg: ChatMessage = {
      id: `user-photo-${msgId}`,
      type: "user",
      mode: "video",
      source: sourceName,
    };

    const assistantMsgId = `assistant-photo-${msgId}`;
    const loadingMsg: ChatMessage = {
      id: assistantMsgId,
      type: "assistant",
      mode: "video",
      isLoading: true,
    };

    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setIsProcessing(true);
    setSelectedHistoryId(null);

    try {
      const result = await transcribeImageAndTranslate(file);

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                isLoading: false,
                mode: "video" as const,
                transcriptText: result.transcriptText,
                englishText: result.englishText,
                hinglishText: result.hinglishText,
                detectedLanguage: result.detectedLanguage,
              }
            : m,
        ),
      );

      // Save user activity (best-effort)
      try {
        const userId = localStorage.getItem("ast_user_id") ?? "";
        const userName = localStorage.getItem("ast_user_name") ?? "";
        const userEmail = localStorage.getItem("ast_user_email") ?? "";
        await saveUserActivity.mutateAsync({
          id: generateId(),
          userId,
          userName,
          userEmail,
          activityType: "video",
          inputText: result.transcriptText,
          outputText: result.englishText,
          sourceFile: sourceName,
          detectedLanguage: result.detectedLanguage,
          timestamp: BigInt(Date.now()) * 1_000_000n,
        });
      } catch {
        // Silently ignore activity save failures
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

      toast.error("Image processing failed");
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Alt language request for chat messages ──────────────────────────────────
  const handleRequestAltTranslation = async (
    msgId: string,
    language: string,
  ) => {
    const msg = messages.find((m) => m.id === msgId);
    if (!msg?.chatInputText) return;

    try {
      const altText = await translateText(msg.chatInputText, language);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId
            ? { ...m, chatAltLanguage: language, chatAltText: altText }
            : m,
        ),
      );
    } catch {
      toast.error("Could not translate to selected language");
    }
  };

  // ── Alt language request for video messages ─────────────────────────────────
  const handleRequestVideoAltTranslation = async (
    msgId: string,
    language: string,
  ) => {
    const msg = messages.find((m) => m.id === msgId);
    if (!msg?.transcriptText) return;

    // Set loading state
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId
          ? {
              ...m,
              videoAltLanguage: language,
              videoAltLoading: true,
              videoAltText: undefined,
            }
          : m,
      ),
    );

    try {
      const altText = await translateText(msg.transcriptText, language);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId
            ? {
                ...m,
                videoAltLanguage: language,
                videoAltText: altText,
                videoAltLoading: false,
              }
            : m,
        ),
      );
    } catch {
      toast.error("Could not translate to selected language");
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId ? { ...m, videoAltLoading: false } : m,
        ),
      );
    }
  };

  // ── History handlers ────────────────────────────────────────────────────────
  const handleSelectHistory = (record: TranscriptionRecord) => {
    setSelectedHistoryId(record.id);
    setSidebarOpen(false);

    const userMsg: ChatMessage = {
      id: `user-history-${record.id}`,
      type: "user",
      mode: "video",
      source: record.source,
    };
    const assistantMsg: ChatMessage = {
      id: `assistant-history-${record.id}`,
      type: "assistant",
      mode: "video",
      transcriptText: record.transcriptText,
      englishText: record.translatedText,
      hinglishText: "",
      detectedLanguage: record.languageSource,
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
                Arabic Scholar Translator
              </h1>
              <p className="text-[10px] font-mono text-muted-foreground/70 mt-0.5 leading-none">
                AI-powered speech to text
              </p>
            </div>
          </div>

          {/* Status pill + Home button + Install button */}
          <div className="ml-auto flex items-center gap-2">
            {isProcessing && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                <WaveformIcon className="text-primary w-4 h-4" isAnimating />
                <span className="text-xs font-mono text-primary">
                  Processing
                </span>
              </div>
            )}
            {hasMessages && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setMessages([]);
                  setSelectedHistoryId(null);
                }}
                data-ocid="nav.home.button"
              >
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline text-xs">Home</span>
              </Button>
            )}
            {/* Header Install App button — hidden once installed */}
            {!isInstalled && canInstall && (
              <button
                type="button"
                onClick={triggerInstall}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/15 border border-primary/35 text-primary text-xs font-semibold hover:bg-primary/25 active:scale-95 transition-all shadow-sm"
                aria-label={isIOS ? "Add to Home Screen" : "Install App"}
                data-ocid="pwa.primary_button"
              >
                {isIOS ? (
                  <Smartphone className="w-3.5 h-3.5" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span className="hidden xs:inline">
                  {isIOS ? "Add to Home Screen" : "Install"}
                </span>
              </button>
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
                    {/* Made by credit below feature boxes */}
                    <div className="mt-6 text-center space-y-2 px-4 py-4 rounded-xl border border-primary/20 bg-primary/5">
                      <p className="text-sm font-semibold text-foreground font-sans">
                        Made by Sayed Hamza Salafi 💙
                      </p>
                      <p className="text-xs font-medium text-foreground/70 font-sans">
                        Contact us for any help
                      </p>
                      <div className="flex flex-col gap-1">
                        <a
                          href="mailto:sayedmohammadhamza45@gmail.com?subject=Help%20regarding%20Arabic%20Scholar%20Translator%20application"
                          className="text-xs text-primary hover:text-primary/80 transition-colors font-medium underline underline-offset-2"
                        >
                          sayedmohammadhamza45@gmail.com
                        </a>
                        <a
                          href="https://wa.me/917838272313?text=Assalamualaikum%20Sayed%20Hamza%20I%20want%20some%20help%20regarding%20your%20application"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:text-primary/80 transition-colors font-medium underline underline-offset-2"
                        >
                          +91 7838272313
                        </a>
                      </div>
                    </div>

                    {/* Install App button — center, prominent, hidden when installed */}
                    {!isInstalled && canInstall && (
                      <div className="mt-6 flex flex-col items-center gap-2">
                        <button
                          type="button"
                          onClick={triggerInstall}
                          className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold font-sans text-sm shadow-lg shadow-primary/30 hover:bg-primary/90 active:scale-95 transition-all"
                          data-ocid="pwa.open_modal_button"
                        >
                          {isIOS ? (
                            <Smartphone className="w-5 h-5" />
                          ) : (
                            <Download className="w-5 h-5" />
                          )}
                          {isIOS ? "Add to Home Screen" : "Install App"}
                        </button>
                        <p className="text-[11px] text-muted-foreground font-sans">
                          {isIOS
                            ? "Install via Safari for quick access"
                            : "Add to home screen for quick access"}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  messages.map((msg) =>
                    msg.type === "user" ? (
                      <UserBubble
                        key={msg.id}
                        mode={msg.mode}
                        source={msg.source}
                        chatInputText={msg.chatInputText}
                      />
                    ) : (
                      <AssistantBubble
                        key={msg.id}
                        mode={msg.mode}
                        transcriptText={msg.transcriptText}
                        englishText={msg.englishText}
                        hinglishText={msg.hinglishText}
                        detectedLanguage={msg.detectedLanguage}
                        videoAltLanguage={msg.videoAltLanguage}
                        videoAltText={msg.videoAltText}
                        videoAltLoading={msg.videoAltLoading}
                        chatOutputText={msg.chatOutputText}
                        chatAltLanguage={msg.chatAltLanguage}
                        chatAltText={msg.chatAltText}
                        isLoading={msg.isLoading}
                        errorMessage={msg.errorMessage}
                        onRequestAltTranslation={
                          msg.mode === "chat"
                            ? (lang) =>
                                handleRequestAltTranslation(msg.id, lang)
                            : undefined
                        }
                        onRequestVideoAltTranslation={
                          msg.mode === "video"
                            ? (lang) =>
                                handleRequestVideoAltTranslation(msg.id, lang)
                            : undefined
                        }
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
              <InputPanel
                onSubmit={handleSubmit}
                onChatSubmit={handleChatSubmit}
                onPhotoSubmit={handlePhotoSubmit}
                isProcessing={isProcessing}
              />
              {/* Footer */}
              <div className="text-center space-y-1.5 pt-2 pb-1 px-3 rounded-xl border border-border bg-card/50">
                <p className="text-xs font-semibold text-foreground font-sans">
                  Made by Sayed Hamza Salafi 💙
                </p>
                <p className="text-[11px] font-medium text-foreground/60 font-sans">
                  Contact us for any help
                </p>
                <p className="text-[11px] font-sans space-x-2">
                  <a
                    href="mailto:sayedmohammadhamza45@gmail.com?subject=Help%20regarding%20Arabic%20Scholar%20Translator%20application"
                    className="text-primary hover:text-primary/80 transition-colors font-medium underline underline-offset-2"
                  >
                    sayedmohammadhamza45@gmail.com
                  </a>
                  <span className="text-muted-foreground/40">·</span>
                  <a
                    href="https://wa.me/917838272313?text=Assalamualaikum%20Sayed%20Hamza%20I%20want%20some%20help%20regarding%20your%20application"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 transition-colors font-medium underline underline-offset-2"
                  >
                    +91 7838272313
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* iOS install instruction modal — shared between header and center buttons */}
      <IOSInstallModal
        open={showIOSModal}
        onClose={() => setShowIOSModal(false)}
      />
    </div>
  );
}
