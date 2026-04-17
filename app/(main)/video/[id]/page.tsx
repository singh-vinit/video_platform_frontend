"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { Video, Comment } from "@/types";
import CommentSection from "@/components/CommentSection";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

interface VideoDetail extends Video {
  comments: Comment[];
  creator: { id: string; name: string };
}

export default function VideoPage() {
  const { id } = useParams<{ id: string }>();
  const [video, setVideo] = useState<VideoDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/videos/${id}`)
      .then((r) => setVideo(r.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="space-y-4">
      <Skeleton className="aspect-video rounded-xl bg-zinc-800" />
      <Skeleton className="h-7 w-2/3 bg-zinc-800" />
      <Skeleton className="h-4 w-1/3 bg-zinc-800" />
    </div>
  );

  if (!video) return <p className="text-zinc-500">Video not found.</p>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Video player */}
      <div className="rounded-xl overflow-hidden bg-black border border-zinc-800">
        <video
          src={video.url}
          controls
          autoPlay={false}
          className="w-full max-h-[60vh] object-contain"
        />
      </div>

      {/* Video info */}
      <div>
        <h1 className="font-syne text-2xl font-bold">{video.title}</h1>
        <div className="flex items-center gap-3 mt-2">
          <Link
            href={`/creator/${video.creator.id}`}
            className="text-sm text-zinc-400 hover:text-zinc-100 font-syne font-semibold transition-colors"
          >
            {video.creator.name}
          </Link>
          <span className="text-zinc-700">·</span>
          <span className="text-xs text-zinc-600">
            {new Date(video.createdAt).toLocaleDateString("en-US", {
              year: "numeric", month: "long", day: "numeric"
            })}
          </span>
        </div>
        {video.description && (
          <p className="mt-3 text-sm text-zinc-500 leading-relaxed">{video.description}</p>
        )}
      </div>

      <Separator className="bg-zinc-800" />

      {/* Live comments */}
      <CommentSection videoId={video.id} initialComments={video.comments} />
    </div>
  );
}