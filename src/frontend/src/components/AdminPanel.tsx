import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  Ban,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Film,
  Loader2,
  LockOpen,
  LogOut,
  MessageSquare,
  Play,
  RefreshCw,
  ShieldCheck,
  Star,
  Trash2,
  Users,
  Video,
  Wrench,
} from "lucide-react";
import { useState } from "react";
import type { Rating, User, UserActivity, VideoRecord } from "../backend.d";
import {
  useBlockUser,
  useDeleteUser,
  useDeleteVideoRecord,
  useGetAllActivities,
  useGetAllBlockedUsers,
  useGetAllRatings,
  useGetAllUsers,
  useGetAllVideoRecords,
  useGetMaintenanceMode,
  useSetMaintenanceMode,
  useUnblockUser,
} from "../hooks/useQueries";

const ADMIN_PASSWORD = "@Hamza2004";

function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp / 1_000_000n);
  return new Date(ms).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function truncate(text: string, maxLen: number): string {
  if (!text) return "—";
  if (text.length <= maxLen) return text;
  return `${text.slice(0, maxLen)}…`;
}

function StarDisplay({ count }: { count: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-3.5 h-3.5 ${
            star <= count
              ? "text-yellow-400 fill-yellow-400"
              : "text-muted-foreground/30"
          }`}
        />
      ))}
    </span>
  );
}

function ActivityTypeBadge({ type }: { type: string }) {
  if (type === "video") {
    return (
      <Badge className="gap-1 text-xs bg-blue-500/15 text-blue-400 border-blue-500/30 hover:bg-blue-500/20">
        <Video className="w-3 h-3" />
        Video
      </Badge>
    );
  }
  return (
    <Badge className="gap-1 text-xs bg-purple-500/15 text-purple-400 border-purple-500/30 hover:bg-purple-500/20">
      <MessageSquare className="w-3 h-3" />
      Chat
    </Badge>
  );
}

function UsersTable({
  users,
  activities,
  blockedUsers,
  isLoading,
}: {
  users: User[];
  activities: UserActivity[];
  blockedUsers: string[];
  isLoading: boolean;
}) {
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<User | null>(null);
  const deleteUser = useDeleteUser();
  const blockUser = useBlockUser();
  const unblockUser = useUnblockUser();

  const handleDelete = async () => {
    if (!confirmDelete) return;
    await deleteUser.mutateAsync(confirmDelete.id);
    setConfirmDelete(null);
  };

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center h-40 text-muted-foreground text-sm"
        data-ocid="admin.users.loading_state"
      >
        Loading users...
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm"
        data-ocid="admin.users.empty_state"
      >
        <ShieldCheck className="w-8 h-8 mb-2 opacity-40" />
        No users registered yet
      </div>
    );
  }

  return (
    <>
      <div
        className="rounded-xl border border-border/60 overflow-hidden"
        data-ocid="admin.users.table"
      >
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              {/* Expand arrow */}
              <TableHead className="w-8 text-xs font-semibold" />
              {/* # -- hidden on mobile */}
              <TableHead className="hidden sm:table-cell w-12 text-xs font-semibold">
                #
              </TableHead>
              <TableHead className="text-xs font-semibold">Name</TableHead>
              {/* Email -- hidden on mobile */}
              <TableHead className="hidden md:table-cell text-xs font-semibold">
                Email
              </TableHead>
              {/* Phone -- hidden on mobile & tablet */}
              <TableHead className="hidden lg:table-cell text-xs font-semibold">
                Phone
              </TableHead>
              {/* Registered -- hidden on mobile & tablet */}
              <TableHead className="hidden lg:table-cell text-xs font-semibold">
                Registered
              </TableHead>
              <TableHead className="text-xs font-semibold text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user, idx) => {
              const userActivities = activities.filter(
                (a) => a.userEmail === user.email,
              );
              const isExpanded = expandedEmail === user.email;
              const isUserBlocked = blockedUsers.includes(user.email);

              return (
                <>
                  <TableRow
                    key={user.id}
                    className={`hover:bg-muted/20 cursor-pointer select-none ${
                      isUserBlocked ? "opacity-60" : ""
                    }`}
                    onClick={() =>
                      setExpandedEmail(isExpanded ? null : user.email)
                    }
                    data-ocid={
                      `admin.users.row.${idx + 1}` as `admin.users.row.${number}`
                    }
                  >
                    {/* Expand icon */}
                    <TableCell className="text-xs text-muted-foreground w-8">
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </TableCell>

                    {/* # -- hidden on mobile */}
                    <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                      {idx + 1}
                    </TableCell>

                    {/* Name + blocked badge */}
                    <TableCell className="text-sm font-medium">
                      <div className="flex flex-col gap-0.5">
                        <span className="flex items-center gap-2">
                          {user.name}
                          {isUserBlocked && (
                            <Badge className="text-[10px] h-4 px-1.5 bg-destructive/15 text-destructive border-destructive/30 hover:bg-destructive/20">
                              Blocked
                            </Badge>
                          )}
                        </span>
                        {/* Email shown inline under name on mobile only */}
                        <span className="md:hidden text-[11px] text-muted-foreground font-normal truncate max-w-[140px]">
                          {user.email}
                        </span>
                      </div>
                    </TableCell>

                    {/* Email column -- hidden on mobile */}
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-[180px]">
                      <span className="truncate block" title={user.email}>
                        {truncate(user.email, 28)}
                      </span>
                    </TableCell>

                    {/* Phone -- hidden on mobile & tablet */}
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {user.phone}
                    </TableCell>

                    {/* Registered -- hidden on mobile & tablet */}
                    <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                      {formatDate(user.timestamp)}
                    </TableCell>

                    {/* Actions -- always visible */}
                    <TableCell
                      className="text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        {/* Block / Unblock */}
                        {isUserBlocked ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 sm:w-auto sm:px-2 sm:gap-1 p-0 text-xs text-green-500 hover:text-green-400 hover:bg-green-500/10"
                            onClick={() => unblockUser.mutate(user.email)}
                            disabled={unblockUser.isPending}
                            title="Unblock user"
                            data-ocid={
                              `admin.users.secondary_button.${idx + 1}` as `admin.users.secondary_button.${number}`
                            }
                          >
                            {unblockUser.isPending ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <LockOpen className="w-3.5 h-3.5" />
                            )}
                            <span className="hidden sm:inline">Unblock</span>
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 sm:w-auto sm:px-2 sm:gap-1 p-0 text-xs text-orange-500 hover:text-orange-400 hover:bg-orange-500/10"
                            onClick={() => blockUser.mutate(user.email)}
                            disabled={blockUser.isPending}
                            title="Block user"
                            data-ocid={
                              `admin.users.toggle.${idx + 1}` as `admin.users.toggle.${number}`
                            }
                          >
                            {blockUser.isPending ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Ban className="w-3.5 h-3.5" />
                            )}
                            <span className="hidden sm:inline">Block</span>
                          </Button>
                        )}

                        {/* Delete */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 sm:w-auto sm:px-2 sm:gap-1 p-0 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setConfirmDelete(user)}
                          title="Delete user data"
                          data-ocid={
                            `admin.users.delete_button.${idx + 1}` as `admin.users.delete_button.${number}`
                          }
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Expanded detail row */}
                  {isExpanded && (
                    <TableRow key={`${user.id}-expanded`}>
                      <TableCell colSpan={7} className="bg-muted/10 p-0">
                        <div className="px-4 sm:px-6 py-4">
                          {/* User details on mobile (phone + registered hidden in main row) */}
                          <div className="flex flex-wrap gap-x-6 gap-y-1 mb-3 text-xs text-muted-foreground lg:hidden">
                            <span>
                              <span className="font-medium text-foreground/70">
                                Email:
                              </span>{" "}
                              {user.email}
                            </span>
                            <span>
                              <span className="font-medium text-foreground/70">
                                Phone:
                              </span>{" "}
                              {user.phone}
                            </span>
                            <span>
                              <span className="font-medium text-foreground/70">
                                Registered:
                              </span>{" "}
                              {formatDate(user.timestamp)}
                            </span>
                          </div>

                          <p className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5" />
                            Activity for {user.name}
                            <Badge
                              variant="secondary"
                              className="ml-1 text-xs h-4 px-1.5 rounded-full"
                            >
                              {userActivities.length}
                            </Badge>
                          </p>
                          {userActivities.length === 0 ? (
                            <p className="text-xs text-muted-foreground/60 italic">
                              No activity recorded for this user yet
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {userActivities.map((act) => (
                                <div
                                  key={act.id}
                                  className="flex items-start gap-3 p-3 rounded-lg bg-background/60 border border-border/40"
                                >
                                  <div className="mt-0.5">
                                    <ActivityTypeBadge
                                      type={act.activityType}
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0 space-y-1">
                                    <p className="text-xs text-foreground/80">
                                      <span className="text-muted-foreground font-medium mr-1">
                                        Input:
                                      </span>
                                      {truncate(act.inputText, 80)}
                                    </p>
                                    <p className="text-xs text-foreground/80">
                                      <span className="text-muted-foreground font-medium mr-1">
                                        Output:
                                      </span>
                                      {truncate(act.outputText, 80)}
                                    </p>
                                  </div>
                                  <span className="text-[10px] text-muted-foreground/60 shrink-0">
                                    {formatDate(act.timestamp)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirm Dialog */}
      <Dialog
        open={!!confirmDelete}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
      >
        <DialogContent className="max-w-sm" data-ocid="admin.users.dialog">
          <DialogHeader>
            <DialogTitle>Delete User Data?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will permanently delete{" "}
            <span className="font-semibold text-foreground">
              {confirmDelete?.name}
            </span>
            's account and all their activity history. This cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmDelete(null)}
              data-ocid="admin.users.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleteUser.isPending}
              data-ocid="admin.users.confirm_button"
            >
              {deleteUser.isPending ? (
                <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
              ) : null}
              Delete Permanently
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function RatingsTable({
  ratings,
  isLoading,
}: { ratings: Rating[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center h-40 text-muted-foreground text-sm"
        data-ocid="admin.ratings.loading_state"
      >
        Loading ratings...
      </div>
    );
  }

  if (ratings.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm"
        data-ocid="admin.ratings.empty_state"
      >
        <Star className="w-8 h-8 mb-2 opacity-40" />
        No ratings submitted yet
      </div>
    );
  }

  const avg = ratings.reduce((acc, r) => acc + r.stars, 0) / ratings.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 px-1">
        <Badge variant="outline" className="text-xs gap-1.5">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          Average: {avg.toFixed(1)} / 5
        </Badge>
        <span className="text-xs text-muted-foreground">
          {ratings.length} rating{ratings.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div
        className="rounded-xl border border-border/60 overflow-hidden"
        data-ocid="admin.ratings.table"
      >
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="w-12 text-xs font-semibold">#</TableHead>
              <TableHead className="text-xs font-semibold">Name</TableHead>
              <TableHead className="text-xs font-semibold">Stars</TableHead>
              <TableHead className="text-xs font-semibold">Comment</TableHead>
              <TableHead className="text-xs font-semibold">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ratings.map((rating, idx) => (
              <TableRow
                key={rating.id}
                className="hover:bg-muted/20"
                data-ocid={
                  `admin.ratings.row.${idx + 1}` as `admin.ratings.row.${number}`
                }
              >
                <TableCell className="text-xs text-muted-foreground">
                  {idx + 1}
                </TableCell>
                <TableCell className="text-sm font-medium">
                  {rating.userName}
                </TableCell>
                <TableCell>
                  <StarDisplay count={rating.stars} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                  {rating.comment || (
                    <span className="italic opacity-50">No comment</span>
                  )}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {formatDate(rating.timestamp)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function ActivityTable({
  activities,
  isLoading,
}: { activities: UserActivity[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center h-40 text-muted-foreground text-sm"
        data-ocid="admin.activity.loading_state"
      >
        Loading activity...
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm"
        data-ocid="admin.activity.empty_state"
      >
        <Activity className="w-8 h-8 mb-2 opacity-40" />
        No activity recorded yet
      </div>
    );
  }

  return (
    <div
      className="rounded-xl border border-border/60 overflow-hidden"
      data-ocid="admin.activity.table"
    >
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="w-12 text-xs font-semibold">#</TableHead>
            <TableHead className="text-xs font-semibold">User</TableHead>
            <TableHead className="text-xs font-semibold">Email</TableHead>
            <TableHead className="text-xs font-semibold">Type</TableHead>
            <TableHead className="text-xs font-semibold">Input</TableHead>
            <TableHead className="text-xs font-semibold">Output</TableHead>
            <TableHead className="text-xs font-semibold">Language</TableHead>
            <TableHead className="text-xs font-semibold">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activities.map((activity, idx) => (
            <TableRow
              key={activity.id}
              className="hover:bg-muted/20"
              data-ocid={
                `admin.activity.row.${idx + 1}` as `admin.activity.row.${number}`
              }
            >
              <TableCell className="text-xs text-muted-foreground">
                {idx + 1}
              </TableCell>
              <TableCell className="text-sm font-medium">
                {activity.userName || (
                  <span className="italic text-muted-foreground/50">
                    Unknown
                  </span>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {activity.userEmail || (
                  <span className="italic opacity-50">—</span>
                )}
              </TableCell>
              <TableCell>
                <ActivityTypeBadge type={activity.activityType} />
              </TableCell>
              <TableCell
                className="text-xs text-muted-foreground max-w-[140px] truncate"
                title={activity.inputText}
              >
                {truncate(activity.inputText, 60)}
              </TableCell>
              <TableCell
                className="text-xs text-muted-foreground max-w-[140px] truncate"
                title={activity.outputText}
              >
                {truncate(activity.outputText, 60)}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {activity.detectedLanguage || (
                  <span className="italic opacity-50">—</span>
                )}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {formatDate(activity.timestamp)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function VideosTab({
  videos,
  isLoading,
}: { videos: VideoRecord[]; isLoading: boolean }) {
  const deleteVideoRecord = useDeleteVideoRecord();
  const [playingVideo, setPlayingVideo] = useState<VideoRecord | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    await deleteVideoRecord.mutateAsync(id);
    setConfirmDeleteId(null);
  };

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center h-40 text-muted-foreground text-sm gap-2"
        data-ocid="admin.videos.loading_state"
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading videos...
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm"
        data-ocid="admin.videos.empty_state"
      >
        <Film className="w-8 h-8 mb-2 opacity-40" />
        No videos uploaded yet
      </div>
    );
  }

  return (
    <>
      <div
        className="rounded-xl border border-border/60 overflow-hidden"
        data-ocid="admin.videos.table"
      >
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="w-12 text-xs font-semibold">#</TableHead>
              <TableHead className="text-xs font-semibold">File Name</TableHead>
              <TableHead className="text-xs font-semibold">Uploader</TableHead>
              <TableHead className="text-xs font-semibold">Email</TableHead>
              <TableHead className="text-xs font-semibold">Date</TableHead>
              <TableHead className="text-xs font-semibold text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {videos.map((video, idx) => (
              <TableRow
                key={video.id}
                className="hover:bg-muted/20"
                data-ocid={
                  `admin.videos.row.${idx + 1}` as `admin.videos.row.${number}`
                }
              >
                <TableCell className="text-xs text-muted-foreground">
                  {idx + 1}
                </TableCell>
                <TableCell className="text-sm font-medium max-w-[180px] truncate">
                  <span title={video.fileName}>{video.fileName}</span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {video.uploaderName || (
                    <span className="italic opacity-50">Unknown</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {video.uploaderEmail || (
                    <span className="italic opacity-50">—</span>
                  )}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {formatDate(video.timestamp)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 gap-1 text-xs text-primary hover:text-primary hover:bg-primary/10"
                      onClick={() => setPlayingVideo(video)}
                      data-ocid={
                        `admin.videos.button.${idx + 1}` as `admin.videos.button.${number}`
                      }
                    >
                      <Play className="w-3 h-3" />
                      Play
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 gap-1 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setConfirmDeleteId(video.id)}
                      data-ocid={
                        `admin.videos.delete_button.${idx + 1}` as `admin.videos.delete_button.${number}`
                      }
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Video Player Dialog */}
      <Dialog
        open={!!playingVideo}
        onOpenChange={(open) => !open && setPlayingVideo(null)}
      >
        <DialogContent
          className="max-w-2xl w-full p-4"
          data-ocid="admin.videos.dialog"
        >
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold truncate pr-4">
              {playingVideo?.fileName ?? "Video"}
            </DialogTitle>
          </DialogHeader>
          {playingVideo && (
            <div className="mt-2 rounded-lg overflow-hidden bg-black">
              <video
                src={playingVideo.blob.getDirectURL()}
                controls
                autoPlay
                className="w-full max-h-[60vh] object-contain"
              >
                <track kind="captions" />
              </video>
            </div>
          )}
          <div className="flex justify-end mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPlayingVideo(null)}
              data-ocid="admin.videos.close_button"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog
        open={!!confirmDeleteId}
        onOpenChange={(open) => !open && setConfirmDeleteId(null)}
      >
        <DialogContent
          className="max-w-sm"
          data-ocid="admin.videos.delete_dialog"
        >
          <DialogHeader>
            <DialogTitle>Delete Video?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will permanently delete the video and cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmDeleteId(null)}
              data-ocid="admin.videos.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}
              disabled={deleteVideoRecord.isPending}
              data-ocid="admin.videos.confirm_button"
            >
              {deleteVideoRecord.isPending ? (
                <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
              ) : null}
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const {
    data: users = [],
    isLoading: usersLoading,
    refetch: refetchUsers,
  } = useGetAllUsers();
  const {
    data: ratings = [],
    isLoading: ratingsLoading,
    refetch: refetchRatings,
  } = useGetAllRatings();
  const {
    data: activities = [],
    isLoading: activitiesLoading,
    refetch: refetchActivities,
  } = useGetAllActivities();
  const {
    data: videos = [],
    isLoading: videosLoading,
    refetch: refetchVideos,
  } = useGetAllVideoRecords();
  const { data: blockedUsers = [], refetch: refetchBlocked } =
    useGetAllBlockedUsers();
  const { data: maintenanceMode = false } = useGetMaintenanceMode();
  const setMaintenanceMode = useSetMaintenanceMode();

  const [activeTab, setActiveTab] = useState("users");
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const handleRefresh = () => {
    refetchUsers();
    refetchRatings();
    refetchActivities();
    refetchVideos();
    refetchBlocked();
    setLastRefresh(new Date());
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur-md px-4 lg:px-8 h-14 flex items-center gap-3 sticky top-0 z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center shadow-glow-sm">
            <ShieldCheck className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="font-display font-bold text-base text-foreground leading-none">
              Admin Panel
            </h1>
            <p className="text-[10px] font-mono text-muted-foreground/70 mt-0.5 leading-none">
              Arabic Scholar Translator
            </p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground/50 hidden sm:block">
            Last refreshed: {lastRefresh.toLocaleTimeString()}
          </span>
          <Button
            variant={maintenanceMode ? "destructive" : "outline"}
            size="sm"
            onClick={() => setMaintenanceMode.mutate(!maintenanceMode)}
            disabled={setMaintenanceMode.isPending}
            className={`h-8 gap-1.5 text-xs ${maintenanceMode ? "animate-pulse" : ""}`}
            title={
              maintenanceMode
                ? "Maintenance mode is ON — users see Coming Soon screen. Click to turn OFF."
                : "Turn ON maintenance mode — users will see Coming Soon screen."
            }
            data-ocid="admin.toggle"
          >
            {setMaintenanceMode.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Wrench className="h-3.5 w-3.5" />
            )}
            <span className="hidden xs:inline">
              {maintenanceMode ? "Maintenance: ON" : "Maintenance: OFF"}
            </span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="h-8 gap-1.5 text-muted-foreground hover:text-foreground text-xs"
            data-ocid="admin.secondary_button"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="h-8 gap-1.5 text-xs"
            data-ocid="admin.delete_button"
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold leading-none text-foreground">
                {users.length}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Total Users
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-yellow-500/10 flex items-center justify-center shrink-0">
              <Star className="w-4 h-4 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold leading-none text-foreground">
                {ratings.length}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Ratings</p>
            </div>
          </div>
          <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
              <Activity className="w-4 h-4 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold leading-none text-foreground">
                {activities.length}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Activities</p>
            </div>
          </div>
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
              <Ban className="w-4 h-4 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold leading-none text-foreground">
                {blockedUsers.length}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Blocked</p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6" data-ocid="admin.tab">
            <TabsTrigger value="users" className="gap-1.5 text-xs sm:text-sm">
              Users
              {users.length > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-1 text-xs h-5 px-2 rounded-full font-bold"
                >
                  {users.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="ratings" className="gap-1.5 text-xs sm:text-sm">
              Ratings
              {ratings.length > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-1 text-xs h-5 px-2 rounded-full font-bold"
                >
                  {ratings.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="gap-1.5 text-xs sm:text-sm"
            >
              Activity
              {activities.length > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-1 text-xs h-5 px-2 rounded-full font-bold"
                >
                  {activities.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="videos" className="gap-1.5 text-xs sm:text-sm">
              <Video className="w-3.5 h-3.5" />
              Videos
              {videos.length > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-1 text-xs h-5 px-2 rounded-full font-bold"
                >
                  {videos.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UsersTable
              users={users}
              activities={activities}
              blockedUsers={blockedUsers}
              isLoading={usersLoading}
            />
          </TabsContent>

          <TabsContent value="ratings">
            <RatingsTable ratings={ratings} isLoading={ratingsLoading} />
          </TabsContent>

          <TabsContent value="activity">
            <ActivityTable
              activities={activities}
              isLoading={activitiesLoading}
            />
          </TabsContent>

          <TabsContent value="videos">
            <VideosTab videos={videos} isLoading={videosLoading} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export function AdminPanel() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
      setError("");
    } else {
      setError("Incorrect password. Please try again.");
      setPassword("");
    }
  };

  if (isLoggedIn) {
    return (
      <AdminDashboard
        onLogout={() => {
          setIsLoggedIn(false);
          setPassword("");
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-primary/60 via-primary to-primary/60" />
          <div className="p-8">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center mb-3 shadow-glow-sm">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <h1 className="font-display font-bold text-xl text-foreground">
                Admin Login
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Enter your admin password to continue
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Admin password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  className="bg-background/60 border-border/70 focus:border-primary/60 pr-10"
                  autoComplete="current-password"
                  data-ocid="admin.input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {error && (
                <p
                  className="text-xs text-destructive text-center"
                  data-ocid="admin.error_state"
                >
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full font-semibold"
                data-ocid="admin.submit_button"
              >
                Login to Admin Panel
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
