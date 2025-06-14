// interfaces/Design.ts
export interface IDesign {
    id: string;
    title: string;
    designer: string;
    imageUrl: string;
    tags: string[];
    likes: number;
    description?: string;
    createdAt?: Date;
}