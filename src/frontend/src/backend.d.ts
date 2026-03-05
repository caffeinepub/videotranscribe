import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TranscriptionRecord {
    id: TranscriptionId;
    source: string;
    languageSource: LanguageCode;
    languageTarget: LanguageCode;
    translatedText: string;
    timestamp: Time;
    transcriptText: string;
}
export type TranscriptionId = string;
export type Time = bigint;
export type LanguageCode = string;
export interface TranscriptionRecordInput {
    id: TranscriptionId;
    source: string;
    languageSource: LanguageCode;
    languageTarget: LanguageCode;
    translatedText: string;
    timestamp: Time;
    transcriptText: string;
}
export interface backendInterface {
    clearHistory(): Promise<void>;
    deleteTranscription(id: TranscriptionId): Promise<void>;
    getAllTranscriptions(): Promise<Array<TranscriptionRecord>>;
    saveTranscription(input: TranscriptionRecordInput): Promise<void>;
}
