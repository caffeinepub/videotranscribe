import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type TranscriptionId = string;
export interface UserActivity {
    id: string;
    userName: string;
    inputText: string;
    activityType: string;
    userEmail: string;
    userId: string;
    sourceFile: string;
    timestamp: Time;
    outputText: string;
    detectedLanguage: string;
}
export type Time = bigint;
export interface Rating {
    id: string;
    userName: string;
    comment: string;
    stars: number;
    timestamp: Time;
}
export type LanguageCode = string;
export interface User {
    id: string;
    name: string;
    email: string;
    timestamp: Time;
    phone: string;
}
export interface UserActivityInput {
    id: string;
    userName: string;
    inputText: string;
    activityType: string;
    userEmail: string;
    userId: string;
    sourceFile: string;
    timestamp: Time;
    outputText: string;
    detectedLanguage: string;
}
export interface VideoRecord {
    id: string;
    uploaderName: string;
    blob: ExternalBlob;
    fileName: string;
    timestamp: Time;
    uploaderEmail: string;
}
export interface VideoRecordInput {
    id: string;
    uploaderName: string;
    blob: ExternalBlob;
    fileName: string;
    timestamp: Time;
    uploaderEmail: string;
}
export interface TranscriptionRecord {
    id: TranscriptionId;
    source: string;
    languageSource: LanguageCode;
    languageTarget: LanguageCode;
    translatedText: string;
    timestamp: Time;
    transcriptText: string;
}
export interface RatingInput {
    id: string;
    userName: string;
    comment: string;
    stars: number;
    timestamp: Time;
}
export interface UserInput {
    id: string;
    name: string;
    email: string;
    timestamp: Time;
    phone: string;
}
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
    blockUser(email: string): Promise<void>;
    unblockUser(email: string): Promise<void>;
    isBlocked(email: string): Promise<boolean>;
    getAllBlockedUsers(): Promise<Array<string>>;
    deleteUser(userId: string): Promise<void>;
    clearHistory(): Promise<void>;
    deleteTranscription(id: TranscriptionId): Promise<void>;
    deleteVideoRecord(id: string): Promise<void>;
    getActivitiesByUser(userId: string): Promise<Array<UserActivity>>;
    getAllActivities(): Promise<Array<UserActivity>>;
    getAllRatings(): Promise<Array<Rating>>;
    getAllTranscriptions(): Promise<Array<TranscriptionRecord>>;
    getAllUsers(): Promise<Array<User>>;
    getAllVideoRecords(): Promise<Array<VideoRecord>>;
    saveRating(input: RatingInput): Promise<void>;
    saveTranscription(input: TranscriptionRecordInput): Promise<void>;
    saveUserActivity(input: UserActivityInput): Promise<void>;
    saveUserInfo(input: UserInput): Promise<void>;
    saveVideoRecord(input: VideoRecordInput): Promise<void>;
}
