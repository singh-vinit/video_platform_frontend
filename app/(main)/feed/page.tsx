"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Creator, Video } from "@/types";
import CreatorCard from "@/components/CreatorCard";
import VideoCard from "@/components/VideoCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function FeedPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [subscribedVideos, setSubscribedVideos] = useState<Video[]>([]);
  const [otherVideos, setOtherVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== "USER") router.replace("/dashboard");
  }, [user]);

  useEffect(() => {
    Promise.all([api.get("/creators"), api.get("/subscriptions/feed/me")])
      .then(([creatorsRes, feedRes]) => {
        setCreators(creatorsRes.data);
        setSubscribedVideos(feedRes.data.subscribedVideos);
        setOtherVideos(feedRes.data.otherVideos);
      })
      .catch((err) => {
        console.error("Error fetching feed data:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-48 bg-zinc-800" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl bg-zinc-800" />
          ))}
        </div>
      </div>
    );

  return (
    <div className="space-y-10">
      {/* Creators */}
      <section>
        <h2 className="font-syne text-2xl font-bold mb-4">Creators</h2>
        {creators.length === 0 ? (
          <p className="text-zinc-600 text-sm">No creators yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {creators.map((c) => (
              <CreatorCard key={c.id} creator={c} />
            ))}
          </div>
        )}
      </section>

      <Separator className="bg-zinc-800" />

      {/* Subscribed feed */}
      {subscribedVideos.length > 0 && (
        <section>
          <h2 className="font-syne text-2xl font-bold mb-4">
            From Subscriptions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {subscribedVideos.map((v) => (
              <VideoCard key={v.id} video={v} showCreator />
            ))}
          </div>
        </section>
      )}

      {/* Other videos */}
      {otherVideos.length > 0 && (
        <section>
          <h2 className="font-syne text-2xl font-bold mb-1">Discover</h2>
          <p className="text-zinc-500 text-sm mb-4">Videos from all creators</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {otherVideos.map((v) => (
              <VideoCard key={v.id} video={v} showCreator />
            ))}
          </div>
        </section>
      )}

      {subscribedVideos.length === 0 && otherVideos.length === 0 && (
        <div className="text-center py-16 border border-dashed border-zinc-800 rounded-2xl">
          <p className="font-syne text-xl font-semibold text-zinc-500">
            No videos yet
          </p>
          <p className="text-zinc-600 text-sm mt-2">
            Subscribe to creators above to see their videos
          </p>
        </div>
      )}
    </div>
  );
}
