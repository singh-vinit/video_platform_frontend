"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Creator } from "@/types";
import VideoCard from "@/components/VideoCard";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export default function CreatorPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subLoading, setSubLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get(`/creators/${id}`),
      api.get("/subscriptions/mine"),
    ]).then(([creatorRes, subsRes]) => {
      setCreator(creatorRes.data);
      setSubscribed(subsRes.data.some((s: any) => s.creatorId === id));
    })
    .catch((err) => console.error("Failed to fetch creator or subscriptions:", err))
    .finally(() => setLoading(false));
  }, [id]);

  const toggleSubscribe = async () => {
    setSubLoading(true);
    try {
      if (subscribed) {
        await api.delete(`/subscriptions/${id}`);
        setSubscribed(false);
      } else {
        await api.post(`/subscriptions/${id}`);
        setSubscribed(true);
      }
    }catch (error) {
      console.error("Failed to toggle subscription:", error);
    }
     finally {
      setSubLoading(false);
    }
  };

  if (loading) return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full bg-zinc-800" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-40 bg-zinc-800" />
          <Skeleton className="h-4 w-24 bg-zinc-800" />
        </div>
      </div>
    </div>
  );

  if (!creator) return <p className="text-zinc-500">Creator not found.</p>;

  return (
    <div className="space-y-8">
      {/* Creator header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-zinc-700">
            <AvatarFallback className="bg-zinc-800 text-zinc-100 font-syne font-bold text-2xl">
              {creator.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-syne text-3xl font-bold">{creator.name}</h1>
            <p className="text-zinc-500 text-sm">
              {creator.videos?.length ?? 0} video{creator.videos?.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {user?.role === "USER" && (
          <Button
            onClick={toggleSubscribe}
            disabled={subLoading}
            variant={subscribed ? "outline" : "default"}
            className={subscribed
              ? "border-zinc-700 text-zinc-300 hover:border-red-500/50 hover:text-red-400 font-syne"
              : "bg-zinc-100 hover:bg-white text-zinc-900 font-syne font-semibold"
            }
          >
            {subLoading ? "..." : subscribed ? "Subscribed ✓" : "Subscribe"}
          </Button>
        )}
      </div>

      {/* Videos */}
      <div>
        <h2 className="font-syne text-xl font-semibold mb-4">Videos</h2>
        {!creator.videos?.length ? (
          <div className="text-center py-16 border border-dashed border-zinc-800 rounded-2xl">
            <p className="text-zinc-600 text-sm">No videos uploaded yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {creator.videos.map((v) => <VideoCard key={v.id} video={v} />)}
          </div>
        )}
      </div>
    </div>
  );
}