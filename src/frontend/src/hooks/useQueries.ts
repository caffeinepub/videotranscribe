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
