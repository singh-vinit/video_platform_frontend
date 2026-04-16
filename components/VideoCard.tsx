import Link from "next/link";
import { Video } from "@/types";

interface Props {
  video: Video;
  showCreator?: boolean;
}

export default function VideoCard({ video, showCreator = false }: Props) {
  return (
    <Link href={`/video/${video.id}`}>
      <div className="group bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-600 transition-all duration-200 hover:-translate-y-0.5">
        {/* Thumbnail placeholder */}
        <div className="aspect-video bg-zinc-800 relative overflow-hidden flex items-center justify-center">
          <svg
            className="w-10 h-10 text-zinc-600 group-hover:text-zinc-500 transition-colors"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
          <div className="absolute inset-0 bg-linear-to-t from-zinc-900/60 to-transparent" />
        </div>

        <div className="p-3">
          <p className="font-syne font-semibold text-sm text-zinc-100 line-clamp-2 group-hover:text-white transition-colors">
            {video.title}
          </p>
          <div className="flex items-center justify-between mt-2">
            {showCreator && video.creator && (
              <span className="text-xs text-zinc-500">
                {video.creator.name}
              </span>
            )}
            <span className="text-xs text-zinc-600 ml-auto">
              {new Date(video.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
