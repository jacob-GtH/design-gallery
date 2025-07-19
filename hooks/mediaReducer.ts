// hooks/useMediaReducer.ts
import { MediaItem } from "@/components/admin/Types";

export type MediaAction =
  | { type: "ADD_MEDIA"; items: MediaItem[] }
  | { type: "REMOVE_MEDIA"; index: number }
  | { type: "UPDATE_CAPTION"; index: number; caption: string }
  | { type: "UPDATE_UPLOADED_URL"; index: number; url: string }
  | { type: "UPDATE_PROGRESS"; index: number; progress: number };

export function mediaReducer(state: MediaItem[], action: MediaAction ): MediaItem[] {
  switch (action.type) {
    case "ADD_MEDIA":
      return [...state, ...action.items];
    case "REMOVE_MEDIA":
      return state.filter((_, i) => i !== action.index);
    case "UPDATE_CAPTION":
      return state.map((item, i) =>
        i === action.index ? { ...item, caption: action.caption } : item
      );
    case "UPDATE_UPLOADED_URL":
      return state.map((item, i) =>
        i === action.index ? { ...item, uploadedUrl: action.url } : item
      );
    case "UPDATE_PROGRESS":
      return state.map((item, i) =>
        i === action.index ? { ...item, uploadProgress: action.progress } : item
      );
    default:
      return state;
  }
}

