// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import { IDesign } from "@/interfaces/Design";
import { motion } from "framer-motion";
import { toast } from "sonner";
import DesignFormPage from "@/components/designform/DesignFormPage";
import FloatingAddButton from "@/components/ui/ButtonHard";
import ConfirmModal from "@/components/ui/ConfirmModal";

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

      toast("تم الحذف", { description: "تم حذف التصميم بنجاح" });

      setDesigns((prev) =>
        prev.filter((design) => design.id !== deleteTargetId)
      );
    } catch (err) {
      toast("خطأ", { description: "حدث خطأ أثناء الحذف" });
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
      setError("تعذر تحميل التصاميم");
      toast("خطأ", { description: "حدث خطأ أثناء تحميل البيانات" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesigns();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-10 px-4 sm:px-6 lg:px-20 relative">
      <h1 className="text-4xl font-bold mb-10 text-center text-gray-800">
        🎨 معرض التصاميم
      </h1>

      {loading ? (
        <div className="text-center text-gray-600">جاري التحميل...</div>
      ) : error ? (
        <div className="text-center text-red-600">{error}</div>
      ) : designs.length === 0 ? (
        <div className="text-center text-gray-600">
          <p>لا توجد تصاميم حالياً.</p>
          <button
            onClick={() =>
              toast("إضافة", { description: "زر إضافة التصميم مفعّل" })
            }
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            إضافة تصميم جديد
          </button>
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {designs.map((design, i) => (
            <motion.div
              layout
              key={design.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="relative group rounded-xl overflow-hidden shadow hover:shadow-xl transition border border-gray-200 bg-white">
                {/* ✅ أزرار تعديل/حذف تطفو في الأعلى */}
                <div className="absolute top-2 right-2 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Link
                    href={`/admin/edit/${design.id}`}
                    className="bg-white/80 backdrop-blur-sm hover:bg-white text-blue-600 hover:text-blue-800 p-2 rounded-full shadow-sm transition"
                    title="تعديل"
                  >
                    <Pencil size={16} />
                  </Link>
                  <button
                    onClick={() => setDeleteTargetId(design.id)}
                    className="bg-white/80 backdrop-blur-sm hover:bg-white text-red-600 hover:text-red-800 p-2 rounded-full shadow-sm transition"
                    title="حذف"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* ✅ محتوى التصميم داخل رابط */}
                <Link href={`/designs/${design.id}`} className="block">
                  <div className="relative aspect-video">
                    {design.media[0]?.type === "image" ? (
                      <Image
                        src={design.media[0].url}
                        alt={design.title}
                        fill
                        unoptimized
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <video
                        src={design.media[0].url}
                        muted
                        autoPlay
                        loop
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">
                      {design.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
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
                    </p>
                  </div>
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {showForm && (
        <DesignFormPage
          mode="create"
          onSuccess={async () => {
            await fetchDesigns();
            setShowForm(false);
            toast("نجاح", {
              description: "تم إضافة التصميم بنجاح",
            });
          }}
          onClose={() => setShowForm(false)} // 👈 تمرير الزر للإغلاق
        />
      )}

      {/* زر الإضافة العائم */}

      <FloatingAddButton onClick={() => setShowForm(true)} />

      <ConfirmModal
        isOpen={!!deleteTargetId}
        title="هل أنت متأكد؟"
        description="سيتم حذف هذا التصميم نهائياً."
        confirmText="نعم، احذف"
        cancelText="إلغاء"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </main>
  );
}
