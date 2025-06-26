// interfaces/Design.ts
export interface IDesign {
  id: string
  title: string
  description?: string
  mediaUrl: string
  background: string
  publishedAt?: string
  likes?: number
  designer?: string // اسم المصمم، يتم جلبه بـ "designer": designer->name
  tags?: string[] // أسماء الوسوم، يتم جلبها بـ "tags": tags[]->title
  media: {
    url: string
    type: 'image' | 'video'
    caption?: string
  }[]
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
