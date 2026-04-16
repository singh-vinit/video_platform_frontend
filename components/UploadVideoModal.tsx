"use client";
import { useState, useRef } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import api from "@/lib/api";
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
import { Video } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  onUploaded: (video: Video) => void;
}

export default function UploadVideoModal({ open, onClose, onUploaded }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "uploading" | "saving">("idle");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    if (!file || !title.trim()) return;

    setStatus("uploading");
    const storageRef = ref(storage, `videos/${Date.now()}-${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        setProgress(
          Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
        );
      },
      () => {
        toast.error("Upload failed", { description: "Firebase upload error" });
        setStatus("idle");
      },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        setStatus("saving");
        try {
          const { data } = await api.post("/videos", {
            title,
            description,
            url,
          });
          onUploaded(data);
          toast.success("Video uploaded!", { description: title });
          handleClose();
        } catch {
          toast.error("Save failed", {
            description: "Could not save video metadata",
          });
          setStatus("idle");
        }
      },
    );
  };

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setFile(null);
    setProgress(0);
    setStatus("idle");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="bg-zinc-900 border-zinc-800 max-w-md">
        <DialogHeader>
          <DialogTitle className="font-syne text-xl">Upload Video</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label className="text-zinc-400 text-xs uppercase tracking-wider">
              Title *
            </Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Video title"
              className="bg-zinc-950 border-zinc-800 focus:border-zinc-600"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-zinc-400 text-xs uppercase tracking-wider">
              Description
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              className="bg-zinc-950 border-zinc-800 focus:border-zinc-600 resize-none"
              rows={3}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-zinc-400 text-xs uppercase tracking-wider">
              Video File *
            </Label>
            <div
              onClick={() => fileRef.current?.click()}
              className="border border-dashed border-zinc-700 rounded-lg p-6 text-center cursor-pointer hover:border-zinc-500 transition-colors"
            >
              {file ? (
                <p className="text-sm text-zinc-300 font-syne">{file.name}</p>
              ) : (
                <>
                  <p className="text-sm text-zinc-500">Click to select video</p>
                  <p className="text-xs text-zinc-700 mt-1">
                    MP4, WebM, OGG up to 500MB
                  </p>
                </>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>

          {/* Progress bar */}
          {status === "uploading" && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-zinc-500">
                <span>Uploading to Firebase...</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-zinc-100 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {status === "saving" && (
            <p className="text-xs text-zinc-500 text-center">
              Saving video metadata...
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1 border-zinc-800 text-zinc-400 hover:text-zinc-100"
              disabled={status !== "idle"}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!file || !title.trim() || status !== "idle"}
              className="flex-1 bg-zinc-100 hover:bg-white text-zinc-900 font-syne font-semibold"
            >
              {status === "idle" ? "Upload" : "Uploading..."}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
