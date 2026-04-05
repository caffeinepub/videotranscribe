import Map "mo:core/Map";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";

actor {
  include MixinStorage();

  type LanguageCode = Text;
  type TranscriptionId = Text;
  type FilePath = Text;
  type URL = Text;

  type TranscriptionRecord = {
    id : TranscriptionId;
    source : Text;
    languageSource : LanguageCode;
    languageTarget : LanguageCode;
    transcriptText : Text;
    translatedText : Text;
    timestamp : Time.Time;
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

  type User = {
    id : Text;
    name : Text;
    email : Text;
    phone : Text;
    timestamp : Time.Time;
  };

  type UserInput = {
    id : Text;
    name : Text;
    email : Text;
    phone : Text;
    timestamp : Time.Time;
  };

  type Rating = {
    id : Text;
    userName : Text;
    stars : Nat8;
    comment : Text;
    timestamp : Time.Time;
  };

  type RatingInput = {
    id : Text;
    userName : Text;
    stars : Nat8;
    comment : Text;
    timestamp : Time.Time;
  };

  type UserActivity = {
    id : Text;
    userId : Text;
    userName : Text;
    userEmail : Text;
    activityType : Text;
    inputText : Text;
    outputText : Text;
    sourceFile : Text;
    detectedLanguage : Text;
    timestamp : Time.Time;
  };

  type UserActivityInput = {
    id : Text;
    userId : Text;
    userName : Text;
    userEmail : Text;
    activityType : Text;
    inputText : Text;
    outputText : Text;
    sourceFile : Text;
    detectedLanguage : Text;
    timestamp : Time.Time;
  };

  type VideoRecord = {
    id : Text;
    fileName : Text;
    blob : Storage.ExternalBlob;
    uploaderName : Text;
    uploaderEmail : Text;
    timestamp : Time.Time;
  };

  module VideoRecord {
    public func compareByTimestamp(record1 : VideoRecord, record2 : VideoRecord) : Order.Order {
      Int.compare(record2.timestamp, record1.timestamp);
    };
  };

  type VideoRecordInput = {
    id : Text;
    fileName : Text;
    blob : Storage.ExternalBlob;
    uploaderName : Text;
    uploaderEmail : Text;
    timestamp : Time.Time;
  };

  let transcriptionHistory = Map.empty<TranscriptionId, TranscriptionRecord>();
  let users = Map.empty<Text, User>();
  let ratings = Map.empty<Text, Rating>();
  let userActivities = Map.empty<Text, UserActivity>();
  let videoRecords = Map.empty<Text, VideoRecord>();
  let blockedUsers = Map.empty<Text, Text>();

  stable var maintenanceMode : Bool = false;

  // Maintenance Mode
  public shared ({ caller }) func setMaintenanceMode(enabled : Bool) : async () {
    maintenanceMode := enabled;
  };

  public query ({ caller }) func getMaintenanceMode() : async Bool {
    maintenanceMode;
  };

  // Transcription History Methods
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

  // User Methods
  public shared ({ caller }) func saveUserInfo(input : UserInput) : async () {
    let user : User = {
      id = input.id;
      name = input.name;
      email = input.email;
      phone = input.phone;
      timestamp = input.timestamp;
    };
    users.add(input.id, user);
  };

  public query ({ caller }) func getAllUsers() : async [User] {
    users.values().toArray();
  };

  public shared ({ caller }) func deleteUser(userId : Text) : async () {
    switch (users.get(userId)) {
      case (null) { Runtime.trap("No such user exists") };
      case (?user) {
        users.remove(userId);
        let toRemove = userActivities.values().toArray().filter(
          func(activity) { activity.userId == userId }
        );
        for (activity in toRemove.vals()) {
          userActivities.remove(activity.id);
        };
      };
    };
  };

  // Block/Unblock Methods
  public shared ({ caller }) func blockUser(email : Text) : async () {
    blockedUsers.add(email, email);
  };

  public shared ({ caller }) func unblockUser(email : Text) : async () {
    blockedUsers.remove(email);
  };

  public query ({ caller }) func isBlocked(email : Text) : async Bool {
    switch (blockedUsers.get(email)) {
      case (null) { false };
      case (?_) { true };
    };
  };

  public query ({ caller }) func getAllBlockedUsers() : async [Text] {
    blockedUsers.values().toArray();
  };

  // Rating Methods
  public shared ({ caller }) func saveRating(input : RatingInput) : async () {
    let rating : Rating = {
      id = input.id;
      userName = input.userName;
      stars = input.stars;
      comment = input.comment;
      timestamp = input.timestamp;
    };
    ratings.add(input.id, rating);
  };

  public query ({ caller }) func getAllRatings() : async [Rating] {
    ratings.values().toArray();
  };

  // UserActivity Methods
  public shared ({ caller }) func saveUserActivity(input : UserActivityInput) : async () {
    let activity : UserActivity = {
      id = input.id;
      userId = input.userId;
      userName = input.userName;
      userEmail = input.userEmail;
      activityType = input.activityType;
      inputText = input.inputText;
      outputText = input.outputText;
      sourceFile = input.sourceFile;
      detectedLanguage = input.detectedLanguage;
      timestamp = input.timestamp;
    };
    userActivities.add(input.id, activity);
  };

  public query ({ caller }) func getAllActivities() : async [UserActivity] {
    let activitiesArray = userActivities.values().toArray();
    activitiesArray.reverse();
  };

  public query ({ caller }) func getActivitiesByUser(userId : Text) : async [UserActivity] {
    let filteredActivities = userActivities.values().toArray().filter(
      func(activity) {
        activity.userId == userId;
      }
    );
    filteredActivities.reverse();
  };

  // VideoRecord Methods
  public shared ({ caller }) func saveVideoRecord(input : VideoRecordInput) : async () {
    let record : VideoRecord = {
      id = input.id;
      fileName = input.fileName;
      blob = input.blob;
      uploaderName = input.uploaderName;
      uploaderEmail = input.uploaderEmail;
      timestamp = input.timestamp;
    };
    videoRecords.add(input.id, record);
  };

  public query ({ caller }) func getAllVideoRecords() : async [VideoRecord] {
    videoRecords.values().toArray().sort(VideoRecord.compareByTimestamp);
  };

  public shared ({ caller }) func deleteVideoRecord(id : Text) : async () {
    switch (videoRecords.get(id)) {
      case (null) { Runtime.trap("No such video record exists") };
      case (?_) {
        videoRecords.remove(id);
      };
    };
  };
};
