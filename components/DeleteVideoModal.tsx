"use client";

import { useState } from "react";
import api from "@/lib/api";
import { Video } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Props {
  video: Video | null;
  open: boolean;
  onClose: () => void;
  onDeleted: (id: string) => void;
}

export default function DeleteVideoModal({ video, open, onClose, onDeleted }: Props) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!video) return;
    setLoading(true);
    try {
      await api.delete(`/videos/${video.id}`);
      onDeleted(video.id);
      toast.success("Video deleted");
      onClose();
    } catch (err: any) {
      toast.error("Delete failed", {
        description: err.response?.data?.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-zinc-900 border-zinc-800 max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-syne text-xl">Delete Video</DialogTitle>
        </DialogHeader>

        <div className="mt-2 space-y-5">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3">
            <p className="text-sm text-zinc-300 font-syne font-semibold truncate">
              {video?.title}
            </p>
            {video?.description && (
              <p className="text-xs text-zinc-600 mt-0.5 truncate">{video.description}</p>
            )}
          </div>

          <p className="text-sm text-zinc-400">
            This will permanently delete the video. This action{" "}
            <span className="text-zinc-100 font-semibold">cannot be undone.</span>
          </p>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1 border-zinc-800 text-zinc-400 hover:text-zinc-100"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-syne font-semibold"
            >
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}