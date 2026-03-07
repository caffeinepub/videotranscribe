# Arabic Scholar Translator

## Current State
A full-stack app with video/audio transcription (Groq Whisper), 3-language output (Original + English + Hinglish), chat translator, user registration, admin panel, PWA install support, rating system (3-day cooldown), user activity tracking, and video blob storage.

## Requested Changes (Diff)

### Add
- **Photo upload** tab in InputPanel: user uploads an image, Groq vision API (`llava-v1.5-7b-4096-preview` or `meta-llama/llama-4-scout-17b-16e-instruct`) extracts text from image, then translates to Original (extracted text) + English + Hinglish exactly like video mode. Add image file types (JPG, PNG, WEBP, GIF) to the upload dropzone.
- **"Dua mai yaad rakhiyega - سید حمزہ"** text shown below the rating stars in the modal after user submits rating (in the success toast and/or as a small note in the rating form).
- **User-side "Clear My History"** button: in the main chat interface (not admin), show a small "Clear My History" option that clears only the local chat messages array (localStorage-based, does not call clearHistory backend). Admin panel history is unaffected.

### Modify
- **PWA install fix**: The issue is Chrome shows "Create shortcut" instead of proper install. This happens when:
  1. `manifest.json` icons are missing or not properly sized/typed
  2. Service worker is not properly registered and caching
  3. `display: standalone` may not be set correctly
  
  Fix approach:
  - Ensure `manifest.json` has `"purpose": "any maskable"` on icons
  - Add `"prefer_related_applications": false` to manifest
  - Update service worker to cache more assets (CSS, JS bundles)
  - In `usePWAInstall.ts`, always show the install UI (don't hide when `hasNativePrompt` is false on Android) — the `beforeinstallprompt` event fires when Chrome's installability criteria are met; if it never fires, show Android manual instructions
  - The button label should say "Install App" not "How to Install" — remove "How to Install" text from PWAInstallPrompt.tsx button

- **Rating button**: After user submits rating, show a small centered text "Dua mai yaad rakhiyega - سید حمزہ" below the floating Rate App button area (or inside the modal just before Submit button). The floating button itself should be smaller (px-3 py-2 instead of px-4 py-2.5) to not overlap contact number.

- **YouTube/Instagram URL handling**: Current URL tab just passes the URL to `fetchUrlAsBlob` which fails due to CORS for YouTube/Instagram. New behavior:
  - Detect if URL is YouTube (youtube.com, youtu.be) or Instagram (instagram.com)
  - If detected: show a clear error message "YouTube and Instagram videos cannot be downloaded directly due to browser restrictions. Please download the video to your device first and then upload it using the Upload File tab."
  - This is honest — these URLs will always fail CORS. Better to show clear guidance than a confusing CORS error.
  - For other direct video URLs (e.g. .mp4 links), keep existing behavior.

- **InputPanel**: Add "Photo" tab alongside Upload File / Paste URL / Chat Translate. Accept image files. On submit, call new `transcribeImageAndTranslate` in groq.ts.

### Remove
- Nothing removed

## Implementation Plan

1. **groq.ts** — Add `transcribeImageAndTranslate(file: File): Promise<TranscriptionResult>` function that:
   - Converts image to base64
   - Calls Groq chat API with vision model (`meta-llama/llama-4-scout-17b-16e-instruct`) with image + prompt to extract all visible text
   - Then translates extracted text to English and Hinglish (same as video flow)
   - Returns `TranscriptionResult` shape

2. **groq.ts** — Update URL handling in `transcribeAndTranslate` to detect YouTube/Instagram and throw a descriptive error instead of CORS error.

3. **manifest.json** — Add `"purpose": "any maskable"` to icons, add `"prefer_related_applications": false`.

4. **sw.js** — Update service worker to cache JS/CSS assets from the built app for better installability signal.

5. **InputPanel.tsx** — Add "Photo" tab (4th tab): image dropzone accepting jpg/png/webp/gif, calls `onPhotoSubmit` prop.

6. **TranscribeApp.tsx** — Add `handlePhotoSubmit` handler that calls `transcribeImageAndTranslate`, shows same 3-section output as video mode. Pass `onPhotoSubmit` to InputPanel.

7. **RatingModal.tsx** — Make floating button smaller (px-3 py-2). Add "Dua mai yaad rakhiyega - سید حمزہ" as small italic text inside rating modal below stars/comment, always visible.

8. **TranscribeApp.tsx** — Add user-side "Clear Chat" button in the header (only visible when messages exist). This only calls `setMessages([])` — does NOT call backend `clearHistory`. Keep admin's ability to clear history unchanged.
