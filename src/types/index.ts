export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  createdAt: string;
  isBanned: boolean;
}

export interface Message {
  id: string;
  fromUserId: string;
  fromUsername: string;
  content: string;
  timestamp: string;
  files: UploadedFile[];
  links: string[];
  replies: Reply[];
}

export interface Reply {
  id: string;
  content: string;
  timestamp: string;
  isFromAdmin: boolean;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content: string; // base64 encoded
  uploadedAt: string;
}

export interface AppData {
  users: User[];
  messages: Message[];
  adminPassword: string;
}