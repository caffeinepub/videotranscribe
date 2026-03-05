import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  TranscriptionRecord,
  TranscriptionRecordInput,
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
