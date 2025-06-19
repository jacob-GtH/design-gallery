'use client'

import { useEffect, useReducer, useState } from 'react'
import { FiUpload, FiLoader, FiTrash, FiFileText, FiRepeat, FiImage, FiTag } from 'react-icons/fi'
import { FileTextIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css'

// ============ أنواع البيانات ============
type Designer = {
  _id: string
  name: string
}

type MediaItem = {
  file: File
  previewUrl: string
  type: 'image' | 'video'
  caption: string
  uploadProgress?: number
}

type FormState = {
  title: string
  description: string
  designerId: string
  tags: string[]
  currentTagInput: string
}

type DesignFormState = {
  formData: FormState
  mediaItems: MediaItem[]
  designers: Designer[]
  loading: boolean
  error: string
  success: boolean
  isDragging: boolean
}

// ============ ال reducer لإدارة الحالة ============
function formReducer(state: DesignFormState, action: any): DesignFormState {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.field]: action.value
        }
      }
    case 'ADD_MEDIA':
      return {
        ...state,
        mediaItems: [...state.mediaItems, ...action.items],
        error: ''
      }
    case 'REMOVE_MEDIA':
      return {
        ...state,
        mediaItems: state.mediaItems.filter((_, i) => i !== action.index)
      }
    case 'UPDATE_CAPTION':
      return {
        ...state,
        mediaItems: state.mediaItems.map((item, i) => 
          i === action.index ? {...item, caption: action.value} : item
        )
      }
    case 'UPDATE_PROGRESS':
      return {
        ...state,
        mediaItems: state.mediaItems.map((item, i) => 
          i === action.index ? {...item, uploadProgress: action.progress} : item
        )
      }
    case 'ADD_TAG':
      return {
        ...state,
        formData: {
          ...state.formData,
          tags: [...state.formData.tags, action.tag],
          currentTagInput: ''
        }
      }
    case 'REMOVE_TAG':
      return {
        ...state,
        formData: {
          ...state.formData,
          tags: state.formData.tags.filter((_, i) => i !== action.index)
        }
      }
    case 'SET_DESIGNERS':
      return {
        ...state,
        designers: action.designers
      }
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.loading
      }
    case 'SET_ERROR':
      return {
        ...state,
        error: action.message
      }
    case 'SET_SUCCESS':
      return {
        ...state,
        success: action.value
      }
    case 'SET_DRAGGING':
      return {
        ...state,
        isDragging: action.value
      }
    case 'RESET':
      return {
        ...initialState,
        designers: state.designers
      }
    default:
      return state
  }
}

const initialState: DesignFormState = {
  formData: {
    title: '',
    description: '',
    designerId: '',
    tags: [],
    currentTagInput: ''
  },
  mediaItems: [],
  designers: [],
  loading: false,
  error: '',
  success: false,
  isDragging: false
}

// ============ المكون الرئيسي ============
export default function DesignForm() {
  const router = useRouter()
  const [state, dispatch] = useReducer(formReducer, initialState)
  const { formData, mediaItems, designers, loading, error, success, isDragging } = state
  const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })
  // ============ التأثيرات الجانبية ============
  useEffect(() => {
    // جلب بيانات المصممين
    const fetchDesigners = async () => {
      try {
        const res = await fetch('/api/designers')
        if (!res.ok) throw new Error('Failed to fetch designers')
        const data = await res.json()
        dispatch({ type: 'SET_DESIGNERS', designers: data })
      } catch {
        dispatch({ type: 'SET_ERROR', message: 'فشل في تحميل قائمة المصممين' })
      }
    }

    // تحميل المسودة المحفوظة
    const loadDraft = () => {
      const savedData = localStorage.getItem('designFormDraft')
      if (savedData) {
        const { formData, mediaItems } = JSON.parse(savedData)
        dispatch({ type: 'LOAD_DRAFT', data: { formData, mediaItems } })
      }
    }

    fetchDesigners()
    loadDraft()

    // منع المغادرة عند وجود تغييرات غير محفوظة
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (formData.title || mediaItems.length > 0) {
        e.preventDefault()
        e.returnValue = 'لديك تغييرات غير محفوظة، هل تريد المغادرة؟'
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  // حفظ المسودة كل 10 ثواني
  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (formData.title || mediaItems.length > 0) {
        localStorage.setItem('designFormDraft', JSON.stringify({
          formData,
          mediaItems
        }))
      }
    }, 10000)

    return () => clearInterval(saveInterval)
  }, [formData, mediaItems])

  // ============ معالجة الملفات ============
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    dispatch({ type: 'SET_DRAGGING', value: true })
  }

  const handleDragLeave = () => {
    dispatch({ type: 'SET_DRAGGING', value: false })
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    dispatch({ type: 'SET_DRAGGING', value: false })
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange({ target: { files: e.dataTransfer.files } } as any)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    const validFiles = files.filter(file => {
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        dispatch({ type: 'SET_ERROR', message: `الملف ${file.name} يتجاوز الحد الأقصى للحجم (10MB)` })
        return false
      }
      if (!file.type.match(/image\/.*|video\/.*/)) {
        dispatch({ type: 'SET_ERROR', message: `نوع الملف ${file.name} غير مدعوم` })
        return false
      }
      return true
    })

    const newItems = validFiles.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      type: file.type.startsWith('video') ? 'video' as const : 'image' as const,
      caption: '',
      uploadProgress: undefined
    }))

    dispatch({ type: 'ADD_MEDIA', items: newItems })
    // بعد قراءة الملفات
e.target.value = ''

  }

  // ============ معالجة النموذج ============
  const handleCaptionChange = (index: number, value: string) => {
    dispatch({ type: 'UPDATE_CAPTION', index, value })
  }

  const removeMediaItem = (index: number) => {
    dispatch({ type: 'REMOVE_MEDIA', index })
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    dispatch({ type: 'UPDATE_FIELD', field: name, value })
    dispatch({ type: 'SET_ERROR', message: '' })
  }

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && formData.currentTagInput.trim()) {
      e.preventDefault()
      dispatch({ type: 'ADD_TAG', tag: formData.currentTagInput.trim() })
    }
  }

  const handleRemoveTag = (index: number) => {
    dispatch({ type: 'REMOVE_TAG', index })
  }

  // ============ رفع الملفات ============
  const uploadMediaItems = async () => {
    const uploaded = []
    
    for (const [index, item] of mediaItems.entries()) {
      try {
        const data = new FormData()
        data.append('file', item.file)
        data.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!)

        dispatch({ type: 'UPDATE_PROGRESS', index, progress: 0 })

        const cloud = await uploadWithProgress(data, item.type, index)
        uploaded.push({
          url: cloud.secure_url,
          type: item.type,
          caption: item.caption,
        })
      } catch (error) {
        console.error('Upload failed:', error)
        throw error
      }
    }
    
    return uploaded
  }

  const uploadWithProgress = (data: FormData, type: string, index: number) => {
    return new Promise<any>((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      
      xhr.upload.addEventListener('progress', (e) => {
        const percent = Math.round((e.loaded / e.total) * 100)
        dispatch({ type: 'UPDATE_PROGRESS', index, progress: percent })
      })

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText))
        } else {
          reject(xhr.statusText)
        }
      }

      xhr.onerror = () => reject(xhr.statusText)
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${type}/upload`)
      xhr.send(data)
    })
  }

  // ============ إرسال النموذج ============
  const validateForm = () => {
    if (!formData.title.trim()) return 'العنوان مطلوب'
    if (!formData.designerId) return 'الرجاء اختيار مصمم'
    if (mediaItems.length === 0) return 'يجب رفع وسائط (صورة أو فيديو)'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validation = validateForm()
    if (validation) {
      dispatch({ type: 'SET_ERROR', message: validation })
      return
    }

    dispatch({ type: 'SET_LOADING', loading: true })
    dispatch({ type: 'SET_ERROR', message: '' })

    try {
      const uploadedMedia = await uploadMediaItems()

      const res = await fetch('/api/designs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          media: uploadedMedia,
        }),
      })

      if (!res.ok) throw new Error(await res.text())

      dispatch({ type: 'SET_SUCCESS', value: true })
      localStorage.removeItem('designFormDraft')
      
      setTimeout(() => {
        router.refresh()
        dispatch({ type: 'RESET' })
      }, 2000)
    } catch (err) {
      dispatch({ type: 'SET_ERROR', message: '❌ حدث خطأ أثناء رفع التصميم' })
    } finally {
      dispatch({ type: 'SET_LOADING', loading: false })
    }
  }

  const resetForm = () => {
    if (confirm('هل تريد حقًا إعادة تعيين النموذج؟ سيتم فقدان جميع التغييرات غير المحفوظة.')) {
      dispatch({ type: 'RESET' })
      localStorage.removeItem('designFormDraft')
    }
  }

  // ============ المكونات المساعدة ============
  const Alert = ({ type, message }: { type: 'error' | 'success', message: string }) => (
    <div className={`p-3 rounded-md ${type === 'error' ? 'bg-red-50 text-red-700 border-l-4 border-red-500' : 'bg-green-50 text-green-700 border-l-4 border-green-500'}`}>
      {message}
    </div>
  )

  const TooltipButton = ({ icon, onClick, tooltip, color, disabled = false }: {
    icon: React.ReactNode,
    onClick: () => void,
    tooltip: string,
    color: 'blue' | 'purple' | 'gray' | 'green',
    disabled?: boolean
  }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
      purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
      gray: 'bg-gray-50 text-gray-600 hover:bg-gray-100',
      green: 'bg-green-50 text-green-600 hover:bg-green-100'
    }
    
    
    return (
      <div className="relative group">
        <button
          onClick={onClick}
          disabled={disabled}
          className={`p-3 rounded-full transition-colors ${colorClasses[color]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {icon}
        </button>
        <span className="absolute right-full mr-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          {tooltip}
        </span>
      </div>
    )
  }

  const ProgressBar = ({ progress }: { progress: number }) => (
    <div className="absolute bottom-0 left-0 right-0 bg-gray-200 h-1.5">
      <div 
        className="bg-blue-500 h-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  )

  const MediaItemPreview = ({ item, index }: { item: MediaItem, index: number }) => (
    <div className="relative group w-full overflow-hidden">
      <div className="relative">
        {item.type === 'image' ? (
          <img 
            src={item.previewUrl} 
            alt="معاينة التصميم" 
            className=" h-auto max-h-[70vh] object-contain mx-auto"
          />
        ) : (
          <video 
            src={item.previewUrl} 
            controls 
            className="w-full h-auto object-contain mx-auto"
          />
        )}
        
        <button
          onClick={() => removeMediaItem(index)}
          className="absolute top-3 right-3 bg-white/80 text-gray-700 p-2 rounded-full hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
        >
          <FiTrash size={18} />
        </button>
        
        {item.uploadProgress !== undefined && (
          <ProgressBar progress={item.uploadProgress} />
        )}
      </div>
    </div>
  )

  const EmptyDropZone = () => (
    <div 
      className={`flex flex-col items-center justify-center h-full border-2 ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-dashed border-gray-300'} rounded-xl bg-gray-100 cursor-pointer transition-colors`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => document.getElementById('file-upload')?.click()}
    >
      <FiImage className="text-4xl text-gray-400 mb-3" />
      <p className="text-gray-500">اسحب وأسقط الملفات هنا أو انقر للرفع</p>
      <p className="text-sm text-gray-400 mt-2">يدعم: JPG, PNG, MP4 (بحد أقصى 10MB)</p>
    
    </div>
    
  )

  // ============ واجهة المستخدم ============
  return (
    <div className="flex flex-col md:flex-row h-full pb-6 justify-center bg-gray-50">
      {/* المنطقة الرئيسية */}
      <div className="w-full md:w-3/4 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* حقل العنوان */}
          <input
            id="title-input"
            type="text"
            name="title"
            placeholder="اسم المشروع..."
            value={formData.title}
            onChange={handleInputChange}
            className="w-full text-3xl font-bold p-2 mb-4 text-center border-none focus:outline-none bg-transparent"
            required
          />
          
          {/* حقل الوصف */}
          <textarea
            id="description-input"
            name="description"
            placeholder="وصف المشروع..."
            value={formData.description}
            onChange={handleInputChange}
            className="w-full p-2 mb-6 border-none text-center focus:outline-none bg-transparent min-h-[100px] text-gray-700"
          />
          
          {/* معاينة الوسائط */}
          <div className="space-y-0">
              <input
        id="file-upload"
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
            {mediaItems.length === 0 ? (
              <EmptyDropZone />
              
            ) : (
              <AnimatePresence>
                {mediaItems.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    transition={{ duration: 0.3 }}
                    >
                    <div className="mx-auto">
                    <MediaItemPreview item={item} index={index} />
                    <div className="my-4">
                  <ReactQuill
    value={item.caption}
    onChange={(value) => handleCaptionChange(index, value)}
    theme="snow"
    placeholder="💬 وصف الوسيط..."
    className="bg-white rounded-md shadow border border-gray-200"
    />
    </div>
                </div>
                </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
          
          {/* العلامات */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, i) => (
                <span key={i} className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center">
                  #{tag}
                  <button 
                    type="button"
                    onClick={() => handleRemoveTag(i)}
                    className="ml-1 text-gray-400 hover:text-red-500"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
            <input
              id="tag-input"
              type="text"
              name="currentTagInput"
              placeholder="أضف علامة (اضغط Enter)"
              value={formData.currentTagInput}
              onChange={handleInputChange}
              onKeyDown={handleAddTag}
              className="bg-gray-100 px-3 py-1 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* معلومات المصمم */}
          <div className="mt-8 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-4 mb-3">
              <span className="text-gray-500">المصمم:</span>
              <select
                name="designerId"
                value={formData.designerId}
                onChange={handleInputChange}
                className="bg-gray-100 px-3 py-1 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">اختر مصمم...</option>
                {designers.map((d) => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </div>
            <p className="text-sm text-gray-500">
              تاريخ الإنشاء: {new Date().toLocaleDateString('ar-EG', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </div>
      
      {/* الشريط الجانبي */}
      <motion.form 
        onSubmit={handleSubmit}
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="fixed right-4 top-1/2 transform -translate-y-1/2 bg-white p-4 rounded-xl shadow-lg space-y-4 border border-gray-100 z-10"
      >
        {error && <Alert type="error" message={error} />}
        {success && <Alert type="success" message="تم رفع التصميم بنجاح" />}
        
        <div className="flex flex-col items-center space-y-3">
          <TooltipButton 
            icon={<FiFileText size={20} />}
            onClick={() => document.getElementById('title-input')?.focus()}
            tooltip="إضافة عنوان"
            color="blue"
          />
          
          <TooltipButton 
            icon={<FileTextIcon size={20} />}
            onClick={() => document.getElementById('description-input')?.focus()}
            tooltip="إضافة وصف"
            color="purple"
          />
          
          <TooltipButton 
            icon={<FiImage size={20} />}
            onClick={() => document.getElementById('file-upload')?.click()}
            tooltip="رفع وسائط"
            color="gray"
          />
          
          <TooltipButton 
            icon={<FiTag size={20} />}
            onClick={() => document.getElementById('tag-input')?.focus()}
            tooltip="إضافة علامة"
            color="green"
          />
          
          <div className="h-px bg-gray-200 w-8"></div>
          
          <TooltipButton 
            icon={loading ? <FiLoader className="animate-spin" size={20} /> : <FiUpload size={20} />}
            onClick={handleSubmit}
            tooltip={loading ? "جاري الرفع..." : "نشر التصميم"}
            color="blue"
            disabled={loading}
          />
          
          <TooltipButton 
            icon={<FiRepeat size={20} />}
            onClick={resetForm}
            tooltip="إعادة تعيين"
            color="gray"
          />
        </div>
      </motion.form>
    </div>
  )
}