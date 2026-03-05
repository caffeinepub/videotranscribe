import Text "mo:core/Text";
import Array "mo:core/Array";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Iter "mo:core/Iter";

actor {
  type LanguageCode = Text;
  type TranscriptionId = Text;
  type FilePath = Text;
  type URL = Text;

  type InProgressState = {
    progress : Nat8; // 0-100
    processingStage : {
      #transcribing;
      #translating;
    };
  };

  type ProcessingState = {
    #new;
    #queued;
    #inProgress : InProgressState;
    #transcribed;
    #done;
  };

  type TranscriptionRequest = {
    var processingState : ProcessingState;
    id : TranscriptionId;
    languageSource : LanguageCode;
    languageTarget : LanguageCode;
    originalFilename : FilePath;
    filePath : FilePath;
    transcriptText : Text;
    filename : FilePath;
    reencodedFileUrl : URL;
    createdDate : Time.Time;
    processingStartDate : ?Time.Time;
    completedDate : ?Time.Time;
    processingDetails : Text;
    attemptedCount : Nat16;
  };

  type ProcessingStateChange = {
    requestId : TranscriptionId;
    from : ProcessingState;
    to : ProcessingState;
    message : Text;
    timestamp : Time.Time;
  };

  module ProcessingStateChange {
    public func compare(change1 : ProcessingStateChange, change2 : ProcessingStateChange) : Order.Order {
      Int.compare(change1.timestamp, change2.timestamp);
    };
  };

  type FFmpegProcessingState = {
    processingState : ProcessingState;
    originalFilename : FilePath;
    encodedFilename : ?FilePath;
    encodedFileSizeKb : ?Nat32;
    inputFileSizeKb : Nat32;
    fileSizeReductionRatio : ?Float;
    processingStartDate : ?Time.Time;
    processingCompletionDate : ?Time.Time;
    processingDetails : Text;
    attemptedCount : Nat16;
  };

  type TranscriptionRecord = {
    id : TranscriptionId;
    source : Text;
    languageSource : LanguageCode;
    languageTarget : LanguageCode;
    transcriptText : Text;
    translatedText : Text;
    timestamp : Time.Time;
  };

  module TranscriptionRecord {
    public func compareByTimestamp(record1 : TranscriptionRecord, record2 : TranscriptionRecord) : Order.Order {
      Int.compare(record1.timestamp, record2.timestamp);
    };
  };

  type TranscriptionRecordInput = {
    id : TranscriptionId;
    source : Text;
    languageSource : LanguageCode;
    languageTarget : LanguageCode;
    transcriptText : Text;
    translatedText : Text;
    timestamp : Time.Time;
  };

  let transcriptionHistory = Map.empty<TranscriptionId, TranscriptionRecord>();

  public shared ({ caller }) func saveTranscription(input : TranscriptionRecordInput) : async () {
    let record : TranscriptionRecord = {
      id = input.id;
      source = input.source;
      languageSource = input.languageSource;
      languageTarget = input.languageTarget;
      transcriptText = input.transcriptText;
      translatedText = input.translatedText;
      timestamp = input.timestamp;
    };
    transcriptionHistory.add(input.id, record);
  };

  public query ({ caller }) func getAllTranscriptions() : async [TranscriptionRecord] {
    transcriptionHistory.values().toArray().reverse();
  };

  public shared ({ caller }) func deleteTranscription(id : TranscriptionId) : async () {
    switch (transcriptionHistory.get(id)) {
      case (null) { Runtime.trap("No such transcription record exists") };
      case (?_) {
        transcriptionHistory.remove(id);
      };
    };
  };

  public shared ({ caller }) func clearHistory() : async () {
    transcriptionHistory.clear();
  };
};
