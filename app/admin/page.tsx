// app/admin/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { PlusCircle } from 'lucide-react'
import DesignForm from '../../components/admin/DesignForm'
import { IDesign } from '../../interfaces/Design'
import { toast } from 'sonner'


const DesignCard = ({ design, onDelete }: { design: IDesign; onDelete: (id: string) => void }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border">
    <div className="relative aspect-video">
      {design.mediaType === 'image' ? (
        <Image
          src={design.mediaUrl}
          alt={design.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      ) : (
        <video
          src={design.mediaUrl}
          controls
          className="w-full h-full object-cover"
        />
      )}
    </div>
    <div className="p-4">
      <h3 className="font-semibold text-lg mb-1 line-clamp-1">{design.title}</h3>
      <p className="text-gray-500 text-sm mb-3">
        {new Date(design.publishedAt).toLocaleDateString('ar-SA', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </p>
      <div className="flex justify-between border-t pt-3">
        <Link
          href={`/admin/edit/${design.id}`}
          className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
        >
          <span>✏️</span>
          <span>تعديل</span>
        </Link>
        <button
          onClick={() => onDelete(design.id)}
          className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
        >
          <span>🗑️</span>
          <span>حذف</span>
        </button>
      </div>
    </div>
  </div>
)

const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="bg-white rounded-lg shadow h-80 animate-pulse border" />
    ))}
  </div>
)

export default function AdminPage() {
  const [designs, setDesigns] = useState<IDesign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const fetchDesigns = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/designs', {
        next: { tags: ['designs'] }
      })
      
      if (!res.ok) throw new Error('فشل في تحميل البيانات')
      
      const data = await res.json()
      setDesigns(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع')

      toast('خطأ', {
        description: 'حدث خطأ غير متوقع',
      })

    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDesigns()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا التصميم؟')) return

    try {
      const res = await fetch(`/api/designs/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('فشل في الحذف')

      toast('تم حذف التصميم بنجاح', {
  description: 'تمت العملية بنجاح',
})
      setDesigns((prev) => prev.filter((design) => design.id !== id))
      setError(null)
      setShowForm(false) // إغلاق النموذج إذا كان مفتوحًا
      // إعادة تحميل التصاميم بعد الحذف
      await fetchDesigns()
    } catch (err) {
      toast('خطأ', {
        description: 'حدث خطأ غير متوقع',
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">لوحة تحكم التصاميم</h1>
          <p className="text-gray-600 mt-2">إدارة جميع تصاميم الموقع</p>
        </header>

        <section className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">كل التصاميم ({designs.length})</h2>
            {!loading && (
              <button
                onClick={fetchDesigns}
                className="text-sm bg-white px-4 py-2 rounded-lg border hover:bg-gray-50 shadow-sm"
              >
                تحديث البيانات
              </button>
            )}
          </div>

          {error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100">
              <p>{error}</p>
              <button
                onClick={fetchDesigns}
                className="mt-2 text-sm bg-red-100 px-3 py-1 rounded"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : loading ? (
            <LoadingSkeleton />
          ) : designs.length === 0 ? (
            <div className="bg-blue-50 text-blue-600 p-6 rounded-lg text-center border border-blue-100">
              <p>لا توجد تصاميم متاحة حالياً</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                أضف تصميم جديد
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {designs.map((design) => (
                <DesignCard
                  key={design.id}
                  design={design}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </section>

        {/* نموذج الإضافة في مودال */}
        {showForm && (

          <div className="fixed  inset-0 h-full bg-black bg-opacity-50 justify-center px-56 py-3 z-50">
           <div className="bg-white h-full rounded-xl shadow-lg p-6 ">
            <div className="bg-white h-full overflow-clip pb-10">
              <div className="flex justify-between items-center p-4">
                <h2 className="text-xl font-semibold">إضافة تصميم جديد</h2>
                <button 
                  onClick={() => setShowForm(false)}
                  className="text-gray-500 hover:text-red-500"
                >
                  ✕
                </button>
              </div>
              <DesignForm
                onSuccess={async () => {
                  await fetchDesigns();
                  setShowForm(false);
                  toast('نجاح', {
                    description: 'تم إضافة التصميم بنجاح',
                  });
                }}
              />
              </div>
            </div>
           </div>
        )}
      </div>

      {/* زر الإضافة العائم */}
      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
      >
        <PlusCircle size={24} />
        <span className="hidden sm:inline">إضافة تصميم</span>
      </button>
    </div>
  )
}