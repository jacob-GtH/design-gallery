import { NextRequest, NextResponse } from 'next/server'
import { client } from '../../../../lib/sanity.client'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params

  try {
    const design = await client.fetch(
      `*[_type == "design" && _id == $idParam][0]{
        _id,
        title,
        description,
        publishedAt,
        likes,
        "designer": designer->name,
        "tags": tags[]->title,
        media[] {
          url,
          type,
          caption
        }
      }`,
      { idParam: id }
    )

    if (!design) return NextResponse.json({ error: 'Design not found' }, { status: 404 })

    return NextResponse.json(design)
  } catch (error) {
    console.error('❌ Failed to fetch design:', error)
    return NextResponse.json({ error: 'Failed to fetch design' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { title, description } = await request.json()

    const updated = await client
      .patch(params.id)
      .set({ title, description })
      .commit()

    return NextResponse.json(updated)
  } catch (error) {
    console.error('❌ Error updating:', error)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params

  try {
    await client.delete(id)

    return NextResponse.json({ message: 'تم حذف التصميم بنجاح' }, { status: 200 })
  } catch (error) {
    console.error('❌ فشل في الحذف:', error)
    return NextResponse.json({ error: 'فشل في الحذف' }, { status: 500 })
  }
}
