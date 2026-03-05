// Groq API key — hardcoded, never exposed in UI
const GROQ_API_KEY = "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";
const GROQ_TRANSCRIPTION_URL =
  "https://api.groq.com/openai/v1/audio/transcriptions";
const GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions";

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB

export interface TranscriptionResult {
  transcriptText: string;
  translatedText: string;
  detectedLanguage: string;
}

export class FileTooLargeError extends Error {
  constructor(sizeMB: number) {
    super(
      `File is ${sizeMB.toFixed(1)}MB. Groq's limit is 25MB. Please use a shorter clip.`,
    );
    this.name = "FileTooLargeError";
  }
}

export class CorsError extends Error {
  constructor() {
    super(
      "Cannot fetch this URL directly due to CORS restrictions. Please download the video file and upload it instead.",
    );
    this.name = "CorsError";
  }
}

async function fetchUrlAsBlob(url: string): Promise<Blob> {
  try {
    const response = await fetch(url, { mode: "cors" });
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }
    return response.blob();
  } catch (err) {
    if (err instanceof TypeError) {
      throw new CorsError();
    }
    throw err;
  }
}

export async function transcribeAndTranslate(
  source: File | string,
  targetLanguage: string,
  targetLanguageCode: string,
): Promise<TranscriptionResult> {
  let file: Blob;
  let filename: string;

  if (source instanceof File) {
    // File upload path
    if (source.size > MAX_FILE_SIZE_BYTES) {
      throw new FileTooLargeError(source.size / (1024 * 1024));
    }
    file = source;
    filename = source.name;
  } else {
    // URL path — fetch and convert to blob
    const blob = await fetchUrlAsBlob(source);
    if (blob.size > MAX_FILE_SIZE_BYTES) {
      throw new FileTooLargeError(blob.size / (1024 * 1024));
    }
    file = blob;
    // Infer filename from URL
    const urlPath = new URL(source).pathname;
    filename = urlPath.split("/").pop() || "audio.mp4";
  }

  // Step 1: Transcription with Groq Whisper
  const formData = new FormData();
  formData.append("file", file, filename);
  formData.append("model", "whisper-large-v3");
  formData.append("response_format", "verbose_json");

  const transcribeResponse = await fetch(GROQ_TRANSCRIPTION_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: formData,
  });

  if (!transcribeResponse.ok) {
    const errData = await transcribeResponse.json().catch(() => ({}));
    const message =
      (errData as { error?: { message?: string } })?.error?.message ||
      transcribeResponse.statusText;
    throw new Error(`Transcription failed: ${message}`);
  }

  interface GroqTranscriptionResponse {
    text: string;
    language?: string;
    segments?: Array<{ text: string }>;
  }

  const transcriptionData =
    (await transcribeResponse.json()) as GroqTranscriptionResponse;
  const transcriptText = transcriptionData.text;
  const detectedLanguage = transcriptionData.language || "unknown";

  // Step 2: Translation (always translate to give the user the target language output)
  let translatedText = transcriptText;
  const isAlreadyTargetLanguage =
    detectedLanguage.toLowerCase() === targetLanguageCode.toLowerCase() ||
    detectedLanguage.toLowerCase() ===
      targetLanguage.toLowerCase().substring(0, 2);

  if (
    !isAlreadyTargetLanguage ||
    targetLanguage.toLowerCase() !== detectedLanguage.toLowerCase()
  ) {
    const chatResponse = await fetch(GROQ_CHAT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `You are a professional translator. Translate the following text to ${targetLanguage}. Return only the translated text, nothing else.`,
          },
          {
            role: "user",
            content: transcriptText,
          },
        ],
        temperature: 0.1,
        max_tokens: 4096,
      }),
    });

    if (!chatResponse.ok) {
      const errData = await chatResponse.json().catch(() => ({}));
      const message =
        (errData as { error?: { message?: string } })?.error?.message ||
        chatResponse.statusText;
      throw new Error(`Translation failed: ${message}`);
    }

    interface GroqChatResponse {
      choices?: Array<{ message?: { content?: string } }>;
    }

    const chatData = (await chatResponse.json()) as GroqChatResponse;
    translatedText = chatData.choices?.[0]?.message?.content || transcriptText;
  }

  return {
    transcriptText,
    translatedText,
    detectedLanguage,
  };
}
