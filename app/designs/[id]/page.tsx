import { notFound } from 'next/navigation'
import { client } from '../../../lib/sanity.client'
import Link from 'next/link'
import Image from 'next/image'
import { FiArrowLeft, FiHeart, FiCalendar, FiUser } from 'react-icons/fi'

export async function generateStaticParams() {
  const designs = await client.fetch(`*[_type == "design"]{ _id }`)
  return designs.map((design: { _id: string }) => ({ id: design._id }))
}

export default async function DesignPage({ params }: { params: { id: string } }) {
  const { id } = await params

  const design = await client.fetch(
    `*[_type == "design" && _id == $id][0]{
      title,
      description,
      mediaUrl,
      mediaType,
      publishedAt,
      likes,
      "designer": designer->{
        name,
        "avatar": avatar.asset->url,
        "slug": slug.current
      },
      "tags": tags[]->title,
      "relatedDesigns": *[_type == "design" && references(^.designer._ref) && _id != ^._id][0..3]{
        title,
        "slug": slug.current,
        "mediaUrl": mediaUrl,
        "mediaType": mediaType
      }
    }`,
    { id }
  )

  if (!design) return notFound()

  const formattedDate = new Date(design.publishedAt).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* زر الرجوع */}
        <div className="mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            الرجوع للصفحة الرئيسية
          </Link>
        </div>

        {/* البطاقة الرئيسية */}
        <div className="bg-white shadow-xl rounded-xl overflow-hidden">
          {/* الوسائط */}
          <div className="relative aspect-video bg-gray-100">
            {design.mediaType === 'image' ? (
              <Image
                src={design.mediaUrl}
                alt={design.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <video 
                src={design.mediaUrl} 
                controls 
                className="w-full h-full object-contain bg-black"
              />
            )}
          </div>

          {/* محتوى التصميم */}
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{design.title}</h1>
                {design.designer && (
                  <Link 
                    href={`/designers/${design.designer.slug}`}
                    className="inline-flex items-center mt-2 text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <FiUser className="mr-1" />
                    {design.designer.name || 'مصمم غير معروف'}
                  </Link>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <FiCalendar className="mr-1" />
                  {formattedDate}
                </span>
                <span className="flex items-center">
                  <FiHeart className="mr-1" />
                  {design.likes || 0} إعجاب
                </span>
              </div>
            </div>

            {design.description && (
              <div className="prose max-w-none text-gray-700 mb-8">
                <p>{design.description}</p>
              </div>
            )}

            {/* الوسوم */}
            {design.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {design.tags.map((tag: string) => (
                  <span 
                    key={tag} 
                    className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* تصاميم ذات صلة */}
            {design.relatedDesigns?.length > 0 && (
              <div className="mt-12">
                <h2 className="text-xl font-bold mb-4">تصاميم أخرى لنفس المصمم</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {design.relatedDesigns.map((related: any) => (
                    <Link 
                      key={related.slug} 
                      href={`/designs/${related.slug}`}
                      className="group"
                    >
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        {related.mediaType === 'image' ? (
                          <Image
                            src={related.mediaUrl}
                            alt={related.title}
                            width={300}
                            height={300}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <video 
                            src={related.mediaUrl}
                            className="w-full h-full object-cover"
                            muted
                            loop
                            playsInline
                          />
                        )}
                      </div>
                      <p className="mt-2 text-sm font-medium text-gray-700 truncate">
                        {related.title}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}