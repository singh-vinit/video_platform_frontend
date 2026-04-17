"use client";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Video } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  onUpdated: (video: Video) => void;
}

export default function EditVideoModal({ video, open, onClose, onUpdated }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // Populate fields when video changes
  useEffect(() => {
    if (video) {
      setTitle(video.title);
      setDescription(video.description || "");
    }
  }, [video]);

  const handleSave = async () => {
    if (!video || !title.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.patch(`/videos/${video.id}`, { title, description });
      onUpdated(data);
      toast.success("Video updated!");
      onClose();
    } catch (err: any) {
      toast.error("Update failed", {
        description: err.response?.data?.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-zinc-900 border-zinc-800 max-w-md">
        <DialogHeader>
          <DialogTitle className="font-syne text-xl">Edit Video</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label className="text-zinc-400 text-xs uppercase tracking-wider">Title *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Video title"
              className="bg-zinc-950 border-zinc-800 focus:border-zinc-600"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-zinc-400 text-xs uppercase tracking-wider">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              className="bg-zinc-950 border-zinc-800 focus:border-zinc-600 resize-none"
              rows={4}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1 border-zinc-800 text-zinc-400 hover:text-zinc-100"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!title.trim() || loading}
              className="flex-1 bg-zinc-100 hover:bg-white text-zinc-900 font-syne font-semibold"
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}