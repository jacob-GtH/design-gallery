import { NextResponse } from 'next/server'

export async function GET() {
    const designs = [
        {
            id: 1,
            title: 'لوحة فنية رقمية',
            image: 'public/images/design1.jpg',
            description: 'تصميم رقمي رائع بألوان جريئة'
        },
        {
            id: 2,
            title: 'تصميم واجهة مستخدم',
            image: '/public/images/design1.jpg',
            description: 'واجهة احترافية لتطبيق موبايل'
        },
        {
            id: '123',
            title: 'تصميم رائع',
            designer: 'أحمد',
            imageUrl: '/public/images/design1.jpg',
            tags: ['جرافيك', 'شعارات'],
            likes: 10,
            createdAt: '2024-05-01T00:00:00.000Z'
        }
    ]

    return NextResponse.json(designs)
}
