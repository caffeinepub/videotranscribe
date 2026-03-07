import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  FileVideo,
  ImageIcon,
  Link,
  Loader2,
  MessageSquare,
  Upload,
  X,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";

export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ar", label: "Arabic" },
  { code: "hi", label: "Hindi" },
  { code: "ur", label: "Urdu" },
  { code: "fr", label: "French" },
  { code: "es", label: "Spanish" },
  { code: "de", label: "German" },
  { code: "pt", label: "Portuguese" },
  { code: "ru", label: "Russian" },
  { code: "tr", label: "Turkish" },
  { code: "fa", label: "Persian" },
  { code: "bn", label: "Bengali" },
  { code: "sw", label: "Swahili" },
  { code: "ms", label: "Malay" },
  { code: "id", label: "Indonesian" },
  { code: "it", label: "Italian" },
  { code: "nl", label: "Dutch" },
  { code: "pl", label: "Polish" },
  { code: "ro", label: "Romanian" },
  { code: "zh", label: "Chinese" },
  { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" },
  { code: "hinglish", label: "Hinglish" },
  { code: "roman_urdu", label: "Roman Urdu" },
] as const;

interface InputPanelProps {
  onSubmit: (
    source: File | string,
    targetLanguage: string,
    targetLanguageCode: string,
  ) => void;
  onChatSubmit: (text: string) => void;
  onPhotoSubmit: (file: File) => void;
  isProcessing: boolean;
}

export function InputPanel({
  onSubmit,
  onChatSubmit,
  onPhotoSubmit,
  isProcessing,
}: InputPanelProps) {
  const [activeTab, setActiveTab] = useState<
    "upload" | "url" | "photo" | "chat"
  >("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [urlValue, setUrlValue] = useState("");
  const [chatText, setChatText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isImageDragging, setIsImageDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((file: File) => {
    const MAX_SIZE = 500 * 1024 * 1024; // 500MB
    if (file.size > MAX_SIZE) {
      alert(
        `File is too large. Maximum allowed size is 500MB. Your file is ${(file.size / (1024 * 1024)).toFixed(1)}MB.`,
      );
      return;
    }
    setSelectedFile(file);
  }, []);

  const handleImageSelect = useCallback((file: File) => {
    const MAX_IMAGE_SIZE = 20 * 1024 * 1024; // 20MB
    if (file.size > MAX_IMAGE_SIZE) {
      alert(
        `Image is too large. Maximum allowed size is 20MB. Your file is ${(file.size / (1024 * 1024)).toFixed(1)}MB.`,
      );
      return;
    }
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file (JPG, PNG, WEBP, GIF).");
      return;
    }
    // Revoke old preview URL to avoid memory leaks
    setImagePreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setSelectedImage(file);
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

  const handleImageDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsImageDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleImageSelect(file);
    },
    [handleImageSelect],
  );

  const handleImageDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsImageDragging(true);
  };

  const handleImageDragLeave = () => setIsImageDragging(false);

  const handleSubmit = () => {
    if (activeTab === "chat") {
      if (!chatText.trim()) return;
      onChatSubmit(chatText.trim());
      setChatText("");
      return;
    }

    if (activeTab === "photo") {
      if (!selectedImage) return;
      onPhotoSubmit(selectedImage);
      return;
    }

    // Video / URL — always sends "English" as target but backend now ignores it
    // and always returns Original + English + Hinglish
    if (activeTab === "upload") {
      if (!selectedFile) return;
      onSubmit(selectedFile, "English", "en");
    } else {
      if (!urlValue.trim()) return;
      onSubmit(urlValue.trim(), "English", "en");
    }
  };

  const canSubmit =
    !isProcessing &&
    (activeTab === "upload"
      ? !!selectedFile
      : activeTab === "url"
        ? !!urlValue.trim()
        : activeTab === "photo"
          ? !!selectedImage
          : !!chatText.trim());

  return (
    <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-4 shadow-card">
      <Tabs
        value={activeTab}
        onValueChange={(v) =>
          setActiveTab(v as "upload" | "url" | "photo" | "chat")
        }
      >
        <div className="mb-4">
          <TabsList className="h-9 bg-muted/40 border border-border p-0.5 rounded-lg w-full grid grid-cols-4">
            <TabsTrigger
              value="upload"
              className="flex items-center gap-1 text-[11px] font-sans px-2 h-7 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary"
              data-ocid="transcribe.tab"
            >
              <Upload className="w-3 h-3 shrink-0" />
              <span className="hidden sm:inline">Upload</span>
              <span className="sm:hidden">Video</span>
            </TabsTrigger>
            <TabsTrigger
              value="url"
              className="flex items-center gap-1 text-[11px] font-sans px-2 h-7 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary"
              data-ocid="transcribe.tab"
            >
              <Link className="w-3 h-3 shrink-0" />
              URL
            </TabsTrigger>
            <TabsTrigger
              value="photo"
              className="flex items-center gap-1 text-[11px] font-sans px-2 h-7 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary"
              data-ocid="photo.tab"
            >
              <ImageIcon className="w-3 h-3 shrink-0" />
              Photo
            </TabsTrigger>
            <TabsTrigger
              value="chat"
              className="flex items-center gap-1 text-[11px] font-sans px-2 h-7 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary"
              data-ocid="transcribe.tab"
            >
              <MessageSquare className="w-3 h-3 shrink-0" />
              <span className="hidden sm:inline">Chat</span>
              <span className="sm:hidden">Chat</span>
            </TabsTrigger>
          </TabsList>
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
                    MP4, MOV, AVI, MP3, WAV — Max 500MB
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

        {/* Photo Tab */}
        <TabsContent value="photo" className="mt-0">
          {selectedImage ? (
            <div className="flex items-center gap-3 p-3 rounded-xl border border-primary/30 bg-primary/5">
              {imagePreviewUrl && (
                <img
                  src={imagePreviewUrl}
                  alt="Selected"
                  className="w-14 h-14 rounded-lg object-cover shrink-0 border border-border/60"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-mono font-medium text-foreground truncate">
                  {selectedImage.name}
                </p>
                <p className="text-xs text-muted-foreground font-sans mt-0.5">
                  {(selectedImage.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedImage(null);
                  setImagePreviewUrl((prev) => {
                    if (prev) URL.revokeObjectURL(prev);
                    return null;
                  });
                }}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <label
              htmlFor="image-upload"
              onDrop={handleImageDrop}
              onDragOver={handleImageDragOver}
              onDragLeave={handleImageDragLeave}
              data-ocid="photo.dropzone"
              className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200 py-8 px-4 text-center block ${
                isImageDragging
                  ? "border-primary bg-primary/10 shadow-glow-sm"
                  : "border-border/60 hover:border-primary/50 hover:bg-primary/5"
              }`}
            >
              <input
                id="image-upload"
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleImageSelect(f);
                }}
                data-ocid="photo.upload_button"
              />
              <div className="flex flex-col items-center gap-2 pointer-events-none">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isImageDragging ? "bg-primary/20" : "bg-muted/40"
                  }`}
                >
                  <ImageIcon
                    className={`w-5 h-5 transition-colors ${
                      isImageDragging ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                </div>
                <div>
                  <p className="text-sm font-sans text-foreground/80">
                    {isImageDragging
                      ? "Drop image here"
                      : "Drop image here or click to browse"}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono mt-1">
                    JPG, PNG, WEBP, GIF — Max 20MB
                  </p>
                </div>
              </div>
            </label>
          )}
          <p className="text-xs text-muted-foreground/60 font-sans mt-2 leading-relaxed">
            Text in the image will be extracted and translated to English &amp;
            Hinglish.
          </p>
        </TabsContent>

        {/* Chat Translate Tab */}
        <TabsContent value="chat" className="mt-0">
          <Textarea
            placeholder="Type anything in any language…"
            value={chatText}
            onChange={(e) => setChatText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && canSubmit) {
                handleSubmit();
              }
            }}
            className="resize-none font-sans text-sm bg-muted/30 border-border focus-visible:ring-primary min-h-[80px]"
            data-ocid="chat.textarea"
          />
          <p className="text-xs text-muted-foreground/50 font-sans mt-1.5">
            Press Ctrl+Enter to translate · Output will be in Hinglish
          </p>
        </TabsContent>
      </Tabs>

      {/* Submit button */}
      <div className="mt-4">
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full h-10 font-display font-semibold text-sm bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 shadow-glow-sm hover:shadow-glow transition-all duration-200 rounded-xl"
          data-ocid={
            activeTab === "chat"
              ? "chat.submit_button"
              : activeTab === "photo"
                ? "photo.submit_button"
                : "transcribe.submit_button"
          }
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing…
            </>
          ) : activeTab === "chat" ? (
            <>
              <MessageSquare className="w-4 h-4 mr-2" />
              Translate to Hinglish
            </>
          ) : activeTab === "photo" ? (
            <>
              <ImageIcon className="w-4 h-4 mr-2" />
              Extract &amp; Translate Text
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
