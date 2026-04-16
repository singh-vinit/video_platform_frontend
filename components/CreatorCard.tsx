import Link from "next/link";
import { Creator } from "@/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function CreatorCard({ creator }: { creator: Creator }) {
  return (
    <Link href={`/creator/${creator.id}`}>
      <div className="group bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-600 transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-3">
        <Avatar className="h-11 w-11 border border-zinc-700">
          <AvatarFallback className="bg-zinc-800 text-zinc-100 font-syne font-bold text-sm">
            {creator.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="font-syne font-semibold text-sm text-zinc-100 group-hover:text-white truncate">
            {creator.name}
          </p>
          <p className="text-xs text-zinc-500">
            Joined {new Date(creator.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </Link>
  );
}