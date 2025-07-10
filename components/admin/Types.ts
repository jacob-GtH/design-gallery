// types.ts
export type DesignFormViewMode = "create" | "edit" | "view";

export type MediaType = "image" | "video";

export type MediaItem = {
  _key: string;
  id: string;
  file: File | null; // File object or null if not uploaded
  previewUrl: string;
  type: MediaType;
  caption: string;
  uploadProgress?: number;
  showToolbar?: boolean;
  showEditor?: boolean;
  timeoutId?: number;
  uploadedUrl?: string;
  
};

export type Designer = {
  _id: string;
  name: string;
};

export type FormState = {
  title: string;
  description: string;
  designerId: string | { _id: string; name: string };
  tags: string[];
  backgroundColor: string;
  mediaItems: MediaItem[];
  designers: Designer[];
  currentTagInput: string;
  error: string;
  loading: boolean;
};
