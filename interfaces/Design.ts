// interfaces/Design.ts
export interface IDesign {
  createdAt: any;
  id: string;
  title: string;
  description?: string;
  backgroundColor: string;
  publishedAt?: string;
  likes?: number;
  designer: { _id: string; name: string } | string;
  tags?: string[]; // أسماء الوسوم، يتم جلبها بـ "tags": tags[]->title
  media: {
    url: string;
    type: "image" | "video";
    caption?: string;
  }[];
  rating?: number;
  viewsCount?: number
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
