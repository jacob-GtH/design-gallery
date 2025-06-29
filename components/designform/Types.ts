// types.ts
export type DesignFormViewMode = "create" | "edit" | "view";

export type MediaType = "image" | "video";

export type MediaItem = {
  id: string;
  file: File;
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
  designerId: string;
  tags: string[];
  backgroundColor: string;
  mediaItems: MediaItem[];
  designers: Designer[];
  currentTagInput: string;
  error: string;
};
