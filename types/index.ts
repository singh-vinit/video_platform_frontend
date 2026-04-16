export interface User {
  id: string;
  name: string;
  role: "CREATOR" | "USER";
}

export interface Video {
  id: string;
  title: string;
  description?: string;
  url: string;
  createdAt: string;
  creatorId: string;
  creator?: { id: string; name: string };
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; name: string };
  videoId: string;
}

export interface Creator {
  id: string;
  name: string;
  createdAt: string;
  videos?: Video[];
}

export interface Subscription {
  id: string;
  creatorId: string;
  creator: { id: string; name: string };
}
