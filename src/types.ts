export interface Project {
  id: string;
  title: string;
  tagline: string;
  category: string;
  tags: string[];
  thumbnail: string;
  images: string[];
  videoDemo?: string;
  overview: string;
  challenge: string;
  solution: string;
  results: string;
  tools: string[];
  liveUrl?: string;
  featured: boolean;
  date: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model" | "system";
  content: string;
  timestamp: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}
