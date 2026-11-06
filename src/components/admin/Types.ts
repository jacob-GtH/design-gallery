// types.ts
export type DesignFormViewMode = "create" | "edit" | "view";

export type Designer = {
  _id: string;
  name: string;
};

/** عنصر داخل كتلة الشبكة */
export type GridItem = {
  caption: string;
  _key: string;
  file: File | null; // null إذا كان مرفوعاً مسبقاً
  previewUrl: string;
  uploadedUrl?: string;
  uploadProgress?: number;
};

/** كتلة محتوى داخل المحرر. caption يحمل HTML (وفي كتلة النص هو المحتوى نفسه). */
export type Block =
  | {
      type: "image" | "video";
      _key: string;
      file: File | null;
      previewUrl: string;
      uploadedUrl?: string;
      caption: string;
      uploadProgress?: number;
    }
  | { type: "text"; _key: string; caption: string }
  | { type: "embed"; _key: string; url: string; caption: string }
  | { type: "grid"; _key: string; columns: number; items: GridItem[]; caption: string };

export type FormState = {
  title: string;
  description: string;
  designerId: string;
  tags: string[];
  backgroundColor: string;
  coverKey: string; // مفتاح كتلة الغلاف المختارة ("" = تلقائي)
  designers: Designer[];
  currentTagInput: string;
  error: string;
  loading: boolean;
};

export type TagInputProps = {
  tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (index: number) => void;
  disabled?: boolean;
};
