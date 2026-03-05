import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, Clock, Trash2, Volume2 } from "lucide-react";
import type { TranscriptionRecord } from "../backend.d";

interface HistorySidebarProps {
  records: TranscriptionRecord[];
  isLoading: boolean;
  selectedId: string | null;
  onSelect: (record: TranscriptionRecord) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  isClearingAll: boolean;
}

function formatTimestamp(ts: bigint): string {
  const ms = Number(ts / 1_000_000n);
  const date = new Date(ms);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function getSourceLabel(source: string): string {
  if (source.startsWith("http")) {
    try {
      return new URL(source).hostname;
    } catch {
      return source.slice(0, 30);
    }
  }
  return source.length > 24 ? `${source.slice(0, 21)}…` : source;
}

export function HistorySidebar({
  records,
  isLoading,
  selectedId,
  onSelect,
  onDelete,
  onClearAll,
  isClearingAll,
}: HistorySidebarProps) {
  const sorted = [...records].sort((a, b) => Number(b.timestamp - a.timestamp));

  return (
    <aside className="flex flex-col h-full border-r border-border bg-sidebar">
      {/* Header */}
      <div className="px-4 py-5 border-b border-border">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <h2 className="font-display font-semibold text-sm tracking-wide text-sidebar-foreground uppercase">
            History
          </h2>
        </div>
        <p className="mt-1 text-xs text-muted-foreground font-mono">
          {records.length} session{records.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* List */}
      <ScrollArea className="flex-1 px-2 py-2">
        {isLoading ? (
          <div className="space-y-2 px-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-12 px-4 text-center"
            data-ocid="transcribe.empty_state"
          >
            <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center mb-3">
              <Volume2 className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground font-sans">
              No transcriptions yet
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Upload a video to get started
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {sorted.map((record, idx) => (
              <button
                key={record.id}
                type="button"
                data-ocid={`transcribe.history_item.${idx + 1}`}
                className={`group relative flex items-start gap-2 px-3 py-3 rounded-lg cursor-pointer transition-all duration-150 w-full text-left ${
                  selectedId === record.id
                    ? "bg-accent border border-primary/30 shadow-glow-sm"
                    : "hover:bg-accent/50 border border-transparent"
                }`}
                onClick={() => onSelect(record)}
              >
                {/* Indicator */}
                {selectedId === record.id && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 bg-primary rounded-r-full" />
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono font-medium text-foreground truncate leading-tight">
                    {getSourceLabel(record.source)}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[10px] font-mono text-primary/80 uppercase tracking-wider">
                      {record.languageSource} → {record.languageTarget}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5 font-sans">
                    {formatTimestamp(record.timestamp)}
                  </p>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(record.id);
                    }}
                    data-ocid={`transcribe.history_delete_button.${idx + 1}`}
                    aria-label="Delete"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                  <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      {records.length > 0 && (
        <div className="px-3 py-3 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 font-sans"
            onClick={onClearAll}
            disabled={isClearingAll}
            data-ocid="transcribe.clear_history_button"
          >
            <Trash2 className="h-3 w-3 mr-1.5" />
            {isClearingAll ? "Clearing…" : "Clear All"}
          </Button>
        </div>
      )}
    </aside>
  );
}
