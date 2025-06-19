// app/admin/edit/[id]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Design } from '../../../../sanity/design-cms/schemaTypes/index' // تأكد من المسار الصحيح
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'

// تحقق من صحة البيانات باستخدام Zod
const designSchema = z.object({
  title: z.string().min(3, 'العنوان يجب أن يكون 3 أحرف على الأقل'),
  description: z.string().optional(),
  mediaUrl: z.string().url('رابط غير صالح'),
  mediaType: z.enum(['image', 'video'])
})

type DesignFormValues = z.infer<typeof designSchema>

export default function EditDesignPage() {
  const params = useParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DesignFormValues>({
    resolver: zodResolver(designSchema)
  })

  // جلب بيانات التصميم
  useEffect(() => {
    const fetchDesign = async () => {
      try {
        const res = await fetch(`/api/designs/${params.id}`)
        
        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status}`)
        }
        
        const data: Design = await res.json()
        reset(data) // تعبئة النموذج تلقائياً
      } catch (error) {
        toast.error('فشل في تحميل التصميم', {
          description: error instanceof Error ? error.message : 'حدث خطأ غير متوقع'
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDesign()
  }, [params.id, reset])

  // تحديث التصميم
  const onSubmit = async (data: DesignFormValues) => {
    try {
      setIsSubmitting(true)
      
      const response = await fetch(`/api/designs/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(await response.text())
      }

      toast.success('تم تحديث التصميم بنجاح')
      router.push('/admin')
      router.refresh() // تحديث بيانات الصفحة السابقة
    } catch (error) {
      toast.error('فشل في التحديث', {
        description: error instanceof Error ? error.message : 'حدث خطأ غير متوقع'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">تعديل التصميم</h1>
        <p className="text-gray-600">تعديل تفاصيل التصميم الموجود</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="title" className="block mb-2 font-medium">
            عنوان التصميم *
          </label>
          <input
            id="title"
            {...register('title')}
            className={`w-full p-3 border rounded-lg ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="أدخل عنوان التصميم"
            disabled={isSubmitting}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block mb-2 font-medium">
            الوصف
          </label>
          <textarea
            id="description"
            {...register('description')}
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-lg"
            placeholder="أدخل وصف التصميم (اختياري)"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="mediaUrl" className="block mb-2 font-medium">
            رابط الوسائط *
          </label>
          <input
            id="mediaUrl"
            {...register('mediaUrl')}
            className={`w-full p-3 border rounded-lg ${errors.mediaUrl ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="أدخل رابط الصورة أو الفيديو"
            disabled={isSubmitting}
          />
          {errors.mediaUrl && (
            <p className="mt-1 text-sm text-red-600">{errors.mediaUrl.message}</p>
          )}
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => router.push('/admin')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={isSubmitting}
          >
            إلغاء
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              <Save className="h-5 w-5" />
            )}
            حفظ التغييرات
          </button>
        </div>
      </form>
    </div>
  )
}