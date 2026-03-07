import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSaveRating } from "../hooks/useQueries";

const RATING_LAST_SUBMITTED_KEY = "ast_rating_last_submitted";
const RATING_COOLDOWN_DAYS = 3;

function shouldShowRatingButton(): boolean {
  const lastSubmitted = localStorage.getItem(RATING_LAST_SUBMITTED_KEY);
  if (!lastSubmitted) return true; // Never rated before
  const lastDate = Number.parseInt(lastSubmitted, 10);
  const now = Date.now();
  const diffMs = now - lastDate;
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays >= RATING_COOLDOWN_DAYS;
}

export function RatingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(0);
  const [comment, setComment] = useState("");
  // Hide button immediately after rating; re-check on next mount/load
  const [buttonVisible, setButtonVisible] = useState(shouldShowRatingButton);
  const saveRating = useSaveRating();

  const handleSubmit = async () => {
    if (selected === 0) {
      toast.error("Please select a star rating");
      return;
    }

    const userName = localStorage.getItem("ast_user_name") || "Anonymous";
    const id = crypto.randomUUID();
    const timestamp = BigInt(Date.now()) * 1_000_000n;

    try {
      await saveRating.mutateAsync({
        id,
        userName,
        stars: selected,
        comment: comment.trim(),
        timestamp,
      });
      // Save the timestamp when user submitted rating
      localStorage.setItem(RATING_LAST_SUBMITTED_KEY, Date.now().toString());
      toast.success("Thank you for your rating! 💙 See you in 3 days!");
      setIsOpen(false);
      setSelected(0);
      setHovered(0);
      setComment("");
      // Hide the button until 3 days have passed
      setButtonVisible(false);
    } catch {
      toast.error("Could not submit rating. Please try again.");
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelected(0);
    setHovered(0);
    setComment("");
  };

  // Don't render anything if button should not be shown
  if (!buttonVisible) return null;

  return (
    <>
      {/* Floating trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-1.5 px-3 py-2 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all duration-200 hover:scale-105 active:scale-95 font-semibold text-xs"
        data-ocid="rating.open_modal_button"
      >
        <Star className="w-4 h-4 fill-current" />
        Rate App
      </button>

      {/* Modal */}
      {isOpen && (
        <div
          aria-modal="true"
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") handleClose();
          }}
          data-ocid="rating.modal"
        >
          <div className="w-full max-w-sm mx-4 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
            {/* Top accent */}
            <div className="h-1 w-full bg-gradient-to-r from-primary/60 via-primary to-primary/60" />

            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display font-bold text-lg text-foreground">
                  Rate this App
                </h2>
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                  data-ocid="rating.close_button"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Stars */}
              <div className="flex items-center justify-center gap-2 mb-5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setSelected(star)}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    className="transition-transform hover:scale-110 active:scale-95"
                    data-ocid={
                      `rating.toggle.${star}` as `rating.toggle.${1 | 2 | 3 | 4 | 5}`
                    }
                  >
                    <Star
                      className={`w-9 h-9 transition-colors ${
                        star <= (hovered || selected)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-muted-foreground/40"
                      }`}
                    />
                  </button>
                ))}
              </div>

              {selected > 0 && (
                <p className="text-center text-xs text-muted-foreground mb-4">
                  {
                    ["", "Poor", "Fair", "Good", "Very Good", "Excellent!"][
                      selected
                    ]
                  }
                </p>
              )}

              {/* Comment */}
              <Textarea
                placeholder="Share your experience (optional)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="bg-background/60 border-border/70 focus:border-primary/60 resize-none mb-4 text-sm"
                data-ocid="rating.textarea"
              />

              {/* Dua text */}
              <p className="text-center text-xs text-muted-foreground/60 italic font-sans mb-3">
                Dua mai yaad rakhiyega — سید حمزہ
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleClose}
                  data-ocid="rating.cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 font-semibold"
                  onClick={handleSubmit}
                  disabled={saveRating.isPending}
                  data-ocid="rating.submit_button"
                >
                  {saveRating.isPending ? "Submitting..." : "Submit Rating"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
