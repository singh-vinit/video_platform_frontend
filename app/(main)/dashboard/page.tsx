"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Video } from "@/types";
import VideoCard from "@/components/VideoCard";
import UploadVideoModal from "@/components/UploadVideoModal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (user && user.role !== "CREATOR") router.replace("/feed");
  }, [user]);

  useEffect(() => {
    api
      .get("/videos/my")
      .then((r) => setVideos(r.data))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    await api.delete(`/videos/${id}`);
    setVideos((prev) => prev.filter((v) => v.id !== id));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-syne text-3xl font-bold">My Videos</h1>
          <p className="text-zinc-500 text-sm mt-1">
            {videos.length} video{videos.length !== 1 ? "s" : ""} uploaded
          </p>
        </div>
        <Button
          onClick={() => setModalOpen(true)}
          className="bg-zinc-100 hover:bg-white text-zinc-900 font-syne font-semibold"
        >
          + Upload Video
        </Button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-video rounded-xl bg-zinc-800" />
              <Skeleton className="h-4 w-3/4 bg-zinc-800" />
              <Skeleton className="h-3 w-1/2 bg-zinc-800" />
            </div>
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-zinc-800 rounded-2xl">
          <p className="font-syne text-xl font-semibold text-zinc-500">
            No videos yet
          </p>
          <p className="text-zinc-600 text-sm mt-2">
            Upload your first video to get started
          </p>
          <Button
            onClick={() => setModalOpen(true)}
            className="mt-6 bg-zinc-100 hover:bg-white text-zinc-900 font-syne font-semibold"
          >
            Upload Video
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {videos.map((v) => (
            <div key={v.id} className="group relative">
              <VideoCard video={v} />
              <button
                onClick={() => handleDelete(v.id)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/80 hover:bg-red-500 text-white rounded-md px-2 py-1 text-xs font-syne"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      <UploadVideoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onUploaded={(v) => setVideos((prev) => [v, ...prev])}
      />
    </div>
  );
}
