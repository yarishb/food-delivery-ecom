export type Role = "user" | "assistant";

export type Message = {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
  error?: boolean;
  streaming?: boolean;
};

export type SessionSummary = {
  id: string;
  title: string;
  message_count: number;
  updated_at: string;
};
