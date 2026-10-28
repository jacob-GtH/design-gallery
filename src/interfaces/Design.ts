// interfaces/Design.ts

/** كتلة محتوى داخل media[]. حقل caption يحمل HTML منظَّفاً (وفي كتلة النص هو المحتوى نفسه). */
export interface IMediaBlock {
  _key?: string;
  type: "image" | "video" | "text" | "embed" | "grid";
  url?: string; // image / video / embed
  caption?: string; // HTML
  columns?: number; // grid
  items?: { _key?: string; url: string }[] | null; // grid
}

export interface IDesign {
  createdAt: string;
  id: string;
  title: string;
  description?: string;
  backgroundColor: string;
  publishedAt?: string;
  likes?: number;
  designer: { _id: string; name: string } | string;
  tags?: string[]; // أسماء الوسوم، يتم جلبها بـ "tags": tags[]->title
  media: IMediaBlock[];
  coverKey?: string | null;
  status?: "draft" | "published";
  rating?: number;
  viewsCount?: number;
}

export interface IDesignSanityRaw {
  _id: string;
  title: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  publishedAt?: string;
  likes?: number;
  designer?: {
    _id: string;
    name: string;
  };
  tags?: string[];
}
