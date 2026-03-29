import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Rating,
  RatingInput,
  TranscriptionRecord,
  TranscriptionRecordInput,
  User,
  UserActivity,
  UserActivityInput,
  UserInput,
  VideoRecord,
} from "../backend.d";
import { useActor } from "./useActor";

// Extended actor type for backend methods added after code generation
type ExtendedActor = ReturnType<typeof useActor>["actor"] & {
  blockUser(email: string): Promise<void>;
  unblockUser(email: string): Promise<void>;
  isBlocked(email: string): Promise<boolean>;
  getAllBlockedUsers(): Promise<Array<string>>;
  deleteUser(userId: string): Promise<void>;
};

export function useGetAllTranscriptions() {
  const { actor, isFetching } = useActor();
  return useQuery<TranscriptionRecord[]>({
    queryKey: ["transcriptions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTranscriptions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveTranscription() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: TranscriptionRecordInput) => {
      if (!actor) throw new Error("Actor not ready");
      await actor.saveTranscription(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transcriptions"] });
    },
  });
}

export function useDeleteTranscription() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not ready");
      await actor.deleteTranscription(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transcriptions"] });
    },
  });
}

export function useClearHistory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      await actor.clearHistory();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transcriptions"] });
    },
  });
}

export function useSaveUserInfo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UserInput) => {
      if (!actor) throw new Error("Actor not ready");
      await actor.saveUserInfo(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useGetAllUsers() {
  const { actor, isFetching } = useActor();
  return useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveRating() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: RatingInput) => {
      if (!actor) throw new Error("Actor not ready");
      await actor.saveRating(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ratings"] });
    },
  });
}

export function useGetAllRatings() {
  const { actor, isFetching } = useActor();
  return useQuery<Rating[]>({
    queryKey: ["ratings"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllRatings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveUserActivity() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (input: UserActivityInput) => {
      if (!actor) throw new Error("Actor not ready");
      await actor.saveUserActivity(input);
    },
  });
}

export function useGetAllActivities() {
  const { actor, isFetching } = useActor();
  return useQuery<UserActivity[]>({
    queryKey: ["activities"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllActivities();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllVideoRecords() {
  const { actor, isFetching } = useActor();
  return useQuery<VideoRecord[]>({
    queryKey: ["videoRecords"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllVideoRecords();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveVideoRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      input: Parameters<NonNullable<typeof actor>["saveVideoRecord"]>[0],
    ) => {
      if (!actor) throw new Error("Actor not ready");
      await actor.saveVideoRecord(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videoRecords"] });
    },
  });
}

export function useDeleteVideoRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not ready");
      await actor.deleteVideoRecord(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videoRecords"] });
    },
  });
}

export function useDeleteUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      if (!actor) throw new Error("Actor not ready");
      await (actor as ExtendedActor).deleteUser(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
  });
}

export function useBlockUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (email: string) => {
      if (!actor) throw new Error("Actor not ready");
      await (actor as ExtendedActor).blockUser(email);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blockedUsers"] });
    },
  });
}

export function useUnblockUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (email: string) => {
      if (!actor) throw new Error("Actor not ready");
      await (actor as ExtendedActor).unblockUser(email);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blockedUsers"] });
    },
  });
}

export function useGetAllBlockedUsers() {
  const { actor, isFetching } = useActor();
  return useQuery<string[]>({
    queryKey: ["blockedUsers"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as ExtendedActor).getAllBlockedUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsBlocked(email: string) {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isBlocked", email],
    queryFn: async () => {
      if (!actor || !email) return false;
      return (actor as ExtendedActor).isBlocked(email);
    },
    enabled: !!actor && !isFetching && !!email,
  });
}
