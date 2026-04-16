"use client";
import { useEffect, useRef, useState } from "react";
import { getSocket } from "@/lib/socket";
import { useAuth } from "@/context/AuthContext";
import { Comment } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Props {
  videoId: string;
  initialComments: Comment[];
}

export default function CommentSection({ videoId, initialComments }: Props) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const socket = getSocket();

  useEffect(() => {
    socket.connect();
    socket.emit("join_video", videoId);
    setConnected(true);

    socket.on("new_comment", (comment: Comment) => {
      setComments((prev) => [comment, ...prev]);
    });

    socket.on("error", (err: { message: string }) => {
      console.error("Socket error:", err.message);
    });

    return () => {
      socket.emit("leave_video", videoId);
      socket.off("new_comment");
      socket.off("error");
      socket.disconnect();
    };
  }, [videoId]);

  const sendComment = () => {
    if (!input.trim() || !connected) return;
    socket.emit("send_comment", { videoId, content: input.trim() });
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendComment();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <h3 className="font-syne font-semibold text-lg">Comments</h3>
        <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
          {comments.length}
        </span>
        <div
          className={`ml-auto w-2 h-2 rounded-full ${connected ? "bg-emerald-500" : "bg-zinc-600"}`}
        />
        <span className="text-xs text-zinc-500">
          {connected ? "Live" : "Connecting..."}
        </span>
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-zinc-800 text-xs font-syne font-bold">
            {user?.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a comment... (Enter to send)"
            className="bg-zinc-900 border-zinc-800 focus:border-zinc-600 resize-none text-sm"
            rows={2}
          />
          <Button
            onClick={sendComment}
            disabled={!input.trim()}
            className="self-end bg-zinc-100 hover:bg-white text-zinc-900 font-syne font-semibold text-xs px-4"
          >
            Send
          </Button>
        </div>
      </div>

      {/* Comments list */}
      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
        {comments.length === 0 ? (
          <p className="text-sm text-zinc-600 text-center py-8">
            No comments yet. Be the first!
          </p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="flex gap-3">
              <Avatar className="h-7 w-7 shrink-0">
                <AvatarFallback className="bg-zinc-800 text-xs font-syne font-bold">
                  {c.user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-syne font-semibold text-zinc-300">
                    {c.user.name}
                  </span>
                  <span className="text-xs text-zinc-600">
                    {new Date(c.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-sm text-zinc-400 mt-0.5 break-words">
                  {c.content}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
