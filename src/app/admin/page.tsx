// src/app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil, Trash2, LayoutGrid, Calendar } from "lucide-react";
import Image from "next/image";
import { IDesign } from "@/interfaces/Design";
import { motion } from "framer-motion";
import { toast } from "sonner";
import DesignFormPage from "@/components/admin/DesignFormPage";
import FloatingAddButton from "@/components/ui/ButtonHart";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { SectionHeader } from "@/components/ui/SectionHeader";

export default function HomePage() {
  const [designs, setDesigns] = useState<IDesign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const confirmDelete = async () => {
    if (!deleteTargetId) return;

    try {
      const res = await fetch(`/api/designs/${deleteTargetId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("فشل في الحذف");

      toast.success("تم الحذف بنجاح");

      setDesigns((prev) =>
        prev.filter((design) => design.id !== deleteTargetId)
      );
    } catch (err) {
      console.error("error during delete:", err);
      toast.error("حدث خطأ أثناء الحذف");
    } finally {
      setDeleteTargetId(null);
    }
  };

  const fetchDesigns = async () => {
    try {
      const res = await fetch("/api/designs");
      if (!res.ok) throw new Error("فشل في تحميل التصاميم");
      const data = await res.json();
      setDesigns(data);
    } catch (err) {
      console.error("error fetching designs:", err);
      setError("تعذر تحميل التصاميم");
      toast.error("حدث خطأ أثناء تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesigns();
  }, []);

  return (
    <main className="min-h-screen bg-white dark:bg-[#050505] text-black dark:text-white py-20 px-4 sm:px-6 lg:px-20 relative overflow-hidden transition-colors duration-500">
      {/* Background Decorative Glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/3 dark:bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none transition-colors duration-500" />
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-purple-500/3 dark:bg-purple-500/5 blur-[120px] rounded-full pointer-events-none transition-colors duration-500" />

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* Section Header الموحد */}
        <SectionHeader
          align="center"
          badge="لوحة التحكم"
          title="معرض الإدارة"
          gradientTitle="والتحكم بالتصاميم"
          description="أضف، عدل، أو احذف التصاميم الخاصة بك من المعرض بسهولة تامة وبتحكم كامل."
          className="mb-16"
        />

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <div className="text-gray-500 dark:text-gray-400 transition-colors duration-500">جاري تحميل التصاميم...</div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="text-red-500 text-lg mb-4 transition-colors duration-500">{error}</div>
            <button 
              onClick={fetchDesigns}
              className="px-6 py-2.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 rounded-xl font-semibold transition-colors duration-500 text-black dark:text-white"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : designs.length === 0 ? (
          <div className="text-center py-20 bg-gray-100 dark:bg-gray-900/20 backdrop-blur-md rounded-3xl border border-gray-200 dark:border-gray-800 p-8 transition-colors duration-500">
            <p className="text-gray-600 dark:text-gray-400 text-lg transition-colors duration-500">لا توجد تصاميم حالياً في المعرض.</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-6 px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg transition-all hover:shadow-[0_10px_30px_rgba(79,70,229,0.3)]"
            >
              إضافة تصميم جديد أول
            </button>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10"
          >
            {designs.map((design, i) => (
              <motion.div
                layout
                key={design.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.6 }}
              >
                <div className="group relative rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800/80 backdrop-blur-md shadow-2xl hover:border-indigo-500/30 transition-all duration-500 flex flex-col h-full">
                  
                  {/* أزرار التحكم العائمة بتصميم نيون عصري */}
                  <div className="absolute top-4 right-4 flex gap-2.5 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-[-10px] group-hover:translate-y-0">
                    <Link
                      href={`/admin/edit/${design.id}`}
                      className="bg-white/90 dark:bg-black/60 backdrop-blur-md border border-gray-200 dark:border-white/10 hover:border-indigo-500/50 hover:bg-indigo-600 hover:text-white text-indigo-600 dark:text-indigo-400 p-2.5 rounded-xl shadow-lg transition-all duration-300"
                      title="تعديل"
                    >
                      <Pencil size={16} />
                    </Link>
                    <button
                      onClick={() => setDeleteTargetId(design.id)}
                      className="bg-white/90 dark:bg-black/60 backdrop-blur-md border border-gray-200 dark:border-white/10 hover:border-red-500/50 hover:bg-red-600 hover:text-white text-red-600 dark:text-red-400 p-2.5 rounded-xl shadow-lg transition-all duration-300"
                      title="حذف"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* محتوى وسائط التصميم */}
                  <Link href={`/designs/${design.id}`} className="block relative overflow-hidden aspect-video">
                    {design.media[0]?.type === "image" ? (
                      <Image
                        src={design.media[0].url}
                        alt={design.title}
                        fill
                        unoptimized
                        className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <video
                        src={design.media[0].url}
                        muted
                        autoPlay
                        loop
                        playsInline
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    )}
                    {/* طبقة تظليل جمالية سفلية للصورة */}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-100 dark:from-gray-950 via-transparent to-transparent opacity-60 transition-colors duration-500" />
                  </Link>

                  {/* تفاصيل النص */}
                  <div className="p-6 flex flex-col flex-grow text-right justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-black dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300 line-clamp-1 mb-3">
                        {design.title}
                      </h3>
                    </div>
                    
                    <div className="flex items-center gap-2 justify-end text-gray-500 dark:text-gray-500 text-xs border-t border-gray-200 dark:border-gray-800/80 pt-4 mt-4 w-full transition-colors duration-500">
                      <span>
                        {design.publishedAt
                          ? new Date(design.publishedAt).toLocaleDateString(
                              "ar-SA",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )
                          : "تاريخ غير متوفر"}
                      </span>
                      <Calendar size={14} className="text-gray-400 dark:text-gray-600 shrink-0 transition-colors duration-500" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {showForm && (
        <DesignFormPage
          mode="create"
          onSuccess={async () => {
            await fetchDesigns();
            setShowForm(false);
            toast.success("تم إضافة التصميم بنجاح إلى المعرض");
          }}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* زر الإضافة العائم المميز */}
      <FloatingAddButton onClick={() => setShowForm(true)} />

      {/* مودال التأكيد الأنيق */}
      <ConfirmModal
        isOpen={!!deleteTargetId}
        title="هل أنت متأكد من الحذف؟"
        description="سيتم حذف هذا التصميم نهائياً ولا يمكن استرجاعه بعد الحذف."
        confirmText="نعم، احذف التصميم"
        cancelText="إلغاء الأمر"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </main>
  );
}
