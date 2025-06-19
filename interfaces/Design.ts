// interfaces/Design.ts
export interface IDesign {
  id: string
  title: string
  description?: string
  mediaUrl: string
  mediaType: 'image' | 'video'
  publishedAt?: string
  likes?: number
  designer?: string // اسم المصمم، يتم جلبه بـ "designer": designer->name
  tags?: string[]   // أسماء الوسوم، يتم جلبها بـ "tags": tags[]->title
}
export interface IDesignSanityRaw {
  _id: string
  title: string
  mediaUrl: string
  mediaType: 'image' | 'video'
  publishedAt?: string
  likes?: number
  designer?: string
  tags?: string[]
}