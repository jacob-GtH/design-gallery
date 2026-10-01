// types.ts
import { MediaAction } from "@/hooks/mediaAction";

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
  designerId: string;
  tags: string[];
  backgroundColor: string;
  mediaItems: MediaItem[];
  designers: Designer[];
  currentTagInput: string;
  error: string;
  loading: boolean;
};
export type Props = {
  item: MediaItem;
  index: number;
  readonly: boolean;
  dispatch: React.Dispatch<MediaAction>;
  removeMediaItem: (index: number) => void;
  moveUp?: (index: number) => void;
  moveDown?: (index: number) => void;
};
export type TagInputProps = {
  tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (index: number) => void;
  disabled?: boolean;
};