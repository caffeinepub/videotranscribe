// Groq API key — hardcoded, never exposed in UI
const GROQ_API_KEY = "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";
const GROQ_TRANSCRIPTION_URL =
  "https://api.groq.com/openai/v1/audio/transcriptions";
const GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions";

const MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024; // 500MB (Groq API itself limits to 25MB)

export interface TranscriptionResult {
  transcriptText: string; // original text from video
  englishText: string; // always English translation
  hinglishText: string; // always Hinglish/Roman Urdu translation
  detectedLanguage: string;
}

export class FileTooLargeError extends Error {
  constructor(sizeMB: number) {
    super(
      `File is ${sizeMB.toFixed(1)}MB. Maximum supported size is 500MB. Please use a shorter clip.`,
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

interface GroqChatResponse {
  choices?: Array<{ message?: { content?: string } }>;
}

async function groqChat(
  systemPrompt: string,
  userContent: string,
): Promise<string> {
  const response = await fetch(GROQ_CHAT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      temperature: 0.1,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const message =
      (errData as { error?: { message?: string } })?.error?.message ||
      response.statusText;
    throw new Error(`Translation failed: ${message}`);
  }

  const data = (await response.json()) as GroqChatResponse;
  return data.choices?.[0]?.message?.content || userContent;
}

export async function translateText(
  text: string,
  targetLanguage: string,
): Promise<string> {
  let systemPrompt: string;

  if (
    targetLanguage.toLowerCase() === "hinglish" ||
    targetLanguage.toLowerCase() === "roman urdu"
  ) {
    systemPrompt =
      "Translate the following text to Hinglish (Roman Urdu mixed with English). Write in Roman script, not Devanagari or Arabic. Keep it casual and natural. Return only the translated text.";
  } else {
    systemPrompt = `You are a professional translator. Translate the following text to ${targetLanguage}. Return only the translated text, nothing else.`;
  }

  return groqChat(systemPrompt, text);
}

export async function transcribeAndTranslate(
  source: File | string,
  targetLanguage: string,
  targetLanguageCode: string,
): Promise<TranscriptionResult> {
  // Suppress unused param warnings — kept for API compatibility
  void targetLanguage;
  void targetLanguageCode;

  let file: Blob;
  let filename: string;

  if (source instanceof File) {
    if (source.size > MAX_FILE_SIZE_BYTES) {
      throw new FileTooLargeError(source.size / (1024 * 1024));
    }
    file = source;
    filename = source.name;
  } else {
    const blob = await fetchUrlAsBlob(source);
    if (blob.size > MAX_FILE_SIZE_BYTES) {
      throw new FileTooLargeError(blob.size / (1024 * 1024));
    }
    file = blob;
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

  // Step 2: Translate to English and Hinglish in parallel
  const [englishText, hinglishText] = await Promise.all([
    groqChat(
      "You are a professional translator. Translate the following text to English. Return only the translated text, nothing else.",
      transcriptText,
    ),
    groqChat(
      "Translate the following text to Hinglish (Roman Urdu mixed with English). Write in Roman script, not Devanagari or Arabic. Keep it casual and natural like everyday speech. Return only the translated text.",
      transcriptText,
    ),
  ]);

  return {
    transcriptText,
    englishText,
    hinglishText,
    detectedLanguage,
  };
}
