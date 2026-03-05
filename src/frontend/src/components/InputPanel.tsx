import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown, FileVideo, Link, Loader2, Upload, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";

export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "ar", label: "Arabic" },
  { code: "hi", label: "Hindi" },
  { code: "zh", label: "Chinese" },
  { code: "ja", label: "Japanese" },
  { code: "pt", label: "Portuguese" },
  { code: "ru", label: "Russian" },
  { code: "it", label: "Italian" },
  { code: "ko", label: "Korean" },
  { code: "tr", label: "Turkish" },
  { code: "nl", label: "Dutch" },
] as const;

interface InputPanelProps {
  onSubmit: (
    source: File | string,
    targetLanguage: string,
    targetLanguageCode: string,
  ) => void;
  isProcessing: boolean;
}

export function InputPanel({ onSubmit, isProcessing }: InputPanelProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "url">("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [urlValue, setUrlValue] = useState("");
  const [targetLang, setTargetLang] = useState("en");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect],
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleSubmit = () => {
    const langEntry = LANGUAGES.find((l) => l.code === targetLang);
    const langLabel = langEntry?.label || "English";

    if (activeTab === "upload") {
      if (!selectedFile) return;
      onSubmit(selectedFile, langLabel, targetLang);
    } else {
      if (!urlValue.trim()) return;
      onSubmit(urlValue.trim(), langLabel, targetLang);
    }
  };

  const canSubmit =
    !isProcessing &&
    (activeTab === "upload" ? !!selectedFile : !!urlValue.trim());

  return (
    <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-4 shadow-card">
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "upload" | "url")}
      >
        <div className="flex items-center justify-between mb-4">
          <TabsList className="h-9 bg-muted/40 border border-border p-0.5 rounded-lg">
            <TabsTrigger
              value="upload"
              className="flex items-center gap-1.5 text-xs font-sans px-3 h-7 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary"
              data-ocid="transcribe.tab"
            >
              <Upload className="w-3 h-3" />
              Upload File
            </TabsTrigger>
            <TabsTrigger
              value="url"
              className="flex items-center gap-1.5 text-xs font-sans px-3 h-7 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary"
              data-ocid="transcribe.tab"
            >
              <Link className="w-3 h-3" />
              Paste URL
            </TabsTrigger>
          </TabsList>

          {/* Language Selector */}
          <Select value={targetLang} onValueChange={setTargetLang}>
            <SelectTrigger
              className="w-36 h-9 text-xs font-mono border-border bg-muted/30 focus:ring-primary"
              data-ocid="transcribe.language_select"
            >
              <SelectValue placeholder="Language" />
              <ChevronDown className="w-3 h-3 ml-auto opacity-50" />
            </SelectTrigger>
            <SelectContent className="font-sans text-sm max-h-60">
              {LANGUAGES.map((lang) => (
                <SelectItem
                  key={lang.code}
                  value={lang.code}
                  className="text-xs font-mono cursor-pointer"
                >
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Upload Tab */}
        <TabsContent value="upload" className="mt-0">
          {selectedFile ? (
            <div className="flex items-center gap-3 p-3 rounded-xl border border-primary/30 bg-primary/5">
              <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                <FileVideo className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-mono font-medium text-foreground truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-muted-foreground font-sans mt-0.5">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <label
              htmlFor="file-upload"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              data-ocid="transcribe.dropzone"
              className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200 py-8 px-4 text-center block ${
                isDragging
                  ? "border-primary bg-primary/10 shadow-glow-sm"
                  : "border-border/60 hover:border-primary/50 hover:bg-primary/5"
              }`}
            >
              <input
                id="file-upload"
                ref={fileInputRef}
                type="file"
                accept="video/*,audio/*"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileSelect(f);
                }}
                data-ocid="transcribe.upload_button"
              />
              <div className="flex flex-col items-center gap-2 pointer-events-none">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isDragging ? "bg-primary/20" : "bg-muted/40"
                  }`}
                >
                  <Upload
                    className={`w-5 h-5 transition-colors ${
                      isDragging ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                </div>
                <div>
                  <p className="text-sm font-sans text-foreground/80">
                    {isDragging
                      ? "Drop to upload"
                      : "Drop video here or click to browse"}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono mt-1">
                    MP4, MOV, AVI, MP3, WAV — Max 25MB
                  </p>
                </div>
              </div>
            </label>
          )}
        </TabsContent>

        {/* URL Tab */}
        <TabsContent value="url" className="mt-0">
          <div className="relative">
            <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              type="url"
              placeholder="https://example.com/video.mp4"
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && canSubmit && handleSubmit()
              }
              className="pl-9 font-mono text-sm bg-muted/30 border-border focus-visible:ring-primary h-11"
              data-ocid="transcribe.url_input"
            />
          </div>
          <p className="text-xs text-muted-foreground/60 font-sans mt-2 leading-relaxed">
            Note: Some URLs may be blocked by CORS. If so, download and upload
            the file directly.
          </p>
        </TabsContent>
      </Tabs>

      {/* Submit button */}
      <div className="mt-4">
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full h-10 font-display font-semibold text-sm bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 shadow-glow-sm hover:shadow-glow transition-all duration-200 rounded-xl"
          data-ocid="transcribe.submit_button"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing…
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Transcribe &amp; Translate
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
