// src/app/admin/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Pencil, Trash2, Calendar, Search } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useDesigns } from "@/hooks/useDesigns";
import FloatingAddButton from "@/components/ui/ButtonHart";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { SectionHeader } from "@/components/ui/SectionHeader";

// تحميل نموذج التصميم بشكل ديناميكي (react-quill ثقيل)
const DesignFormPage = dynamic(
  () => import("@/components/admin/DesignFormPage"),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-black bg-opacity-95 dark:bg-opacity-90 z-[100]">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    ),
  }
);

export default function HomePage() {
  const { t } = useTranslation();
  const { designs, loading, error, retry: fetchDesigns } = useDesigns();
  const [showForm, setShowForm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [designerFilter, setDesignerFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");

  // استخراج قوائم فريدة من المصممين والوسوم
  const designers = Array.from(
    new Set(
      designs
        .map((d) => (typeof d.designer === "object" ? d.designer?.name : d.designer))
        .filter(Boolean) as string[]
    )
  );

  const allTags = Array.from(
    new Set(designs.flatMap((d) => d.tags || []))
  );

  // تصفية التصاميم حسب البحث والمصمم والوسم
  const filteredDesigns = designs.filter((design) => {
    const matchesSearch =
      !searchQuery ||
      design.title.toLowerCase().includes(searchQuery.toLowerCase());

    const designerName =
      typeof design.designer === "object" ? design.designer?.name : design.designer;
    const matchesDesigner = !designerFilter || designerName === designerFilter;

    const matchesTag = !tagFilter || (design.tags || []).includes(tagFilter);

    return matchesSearch && matchesDesigner && matchesTag;
  });

  const confirmDelete = async () => {
    if (!deleteTargetId) return;

    try {
      const res = await fetch(`/api/designs/${deleteTargetId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error(t("admin.deleteError"));

      toast.success(t("admin.deletedSuccess"));

      fetchDesigns();
    } catch (err) {
      console.error("error during delete:", err);
      toast.error(t("admin.deleteError"));
    } finally {
      setDeleteTargetId(null);
    }
  };

  return (
    <main className="min-h-screen bg-white dark:bg-[#050505] text-black dark:text-white py-20 px-4 sm:px-6 lg:px-20 relative overflow-hidden transition-colors duration-500">
      {/* Background Decorative Glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/3 dark:bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none transition-colors duration-500" />
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-purple-500/3 dark:bg-purple-500/5 blur-[120px] rounded-full pointer-events-none transition-colors duration-500" />

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* Section Header الموحد */}
        <SectionHeader
          align="center"
          badge={t("admin.dashboardBadge")}
          title={t("admin.dashboardTitle")}
          gradientTitle={t("admin.dashboardGradientTitle")}
          description={t("admin.dashboardDescription")}
          className="mb-8"
        />

        {/* إحصائيات سريعة */}
        {!loading && !error && designs.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-12">
            <div className="bg-gray-100 dark:bg-gray-900/40 backdrop-blur-md border border-gray-200 dark:border-gray-800 rounded-2xl p-5 text-center transition-colors duration-500">
              <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mb-1">
                {designs.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t("admin.totalDesigns")}
              </div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-900/40 backdrop-blur-md border border-gray-200 dark:border-gray-800 rounded-2xl p-5 text-center transition-colors duration-500">
              <div className="text-3xl font-black text-purple-600 dark:text-purple-400 mb-1">
                {designs.filter((d) => {
                  const date = d.publishedAt ? new Date(d.publishedAt) : null;
                  if (!date) return false;
                  const now = new Date();
                  return (
                    date.getMonth() === now.getMonth() &&
                    date.getFullYear() === now.getFullYear()
                  );
                }).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t("admin.thisMonth")}
              </div>
            </div>
          </div>
        )}

        {/* شريط البحث والفلاتر */}
        {!loading && !error && designs.length > 0 && (
          <div className="flex flex-col md:flex-row gap-3 mb-8 max-w-4xl mx-auto">
            <div className="relative flex-1">
              <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("admin.searchPlaceholder")}
                className="w-full bg-gray-100 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 rounded-xl pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-500"
              />
            </div>
            <select
              value={designerFilter}
              onChange={(e) => setDesignerFilter(e.target.value)}
              className="bg-gray-100 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-500"
            >
              <option value="">{t("admin.allDesigners")}</option>
              {designers.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="bg-gray-100 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-500"
            >
              <option value="">{t("admin.allTags")}</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <div className="text-gray-500 dark:text-gray-400 transition-colors duration-500">{t("admin.loading")}</div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="text-red-500 text-lg mb-4 transition-colors duration-500">{error}</div>
            <button 
              onClick={fetchDesigns}
              className="px-6 py-2.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 rounded-xl font-semibold transition-colors duration-500 text-black dark:text-white"
            >
              {t("admin.retry")}
            </button>
          </div>
        ) : designs.length === 0 ? (
          <div className="text-center py-20 bg-gray-100 dark:bg-gray-900/20 backdrop-blur-md rounded-3xl border border-gray-200 dark:border-gray-800 p-8 transition-colors duration-500">
            <p className="text-gray-600 dark:text-gray-400 text-lg transition-colors duration-500">{t("admin.noDesigns")}</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-6 px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg transition-all hover:shadow-[0_10px_30px_rgba(79,70,229,0.3)]"
            >
              {t("admin.addFirstDesign")}
            </button>
          </div>
        ) : filteredDesigns.length === 0 ? (
          <div className="text-center py-20 bg-gray-100 dark:bg-gray-900/20 backdrop-blur-md rounded-3xl border border-gray-200 dark:border-gray-800 p-8 transition-colors duration-500">
            <p className="text-gray-600 dark:text-gray-400 text-lg transition-colors duration-500">{t("admin.noResults")}</p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10"
          >
            {filteredDesigns.map((design, i) => (
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
                      title={t("admin.edit")}
                    >
                      <Pencil size={16} />
                    </Link>
                    <button
                      onClick={() => setDeleteTargetId(design.id)}
                      className="bg-white/90 dark:bg-black/60 backdrop-blur-md border border-gray-200 dark:border-white/10 hover:border-red-500/50 hover:bg-red-600 hover:text-white text-red-600 dark:text-red-400 p-2.5 rounded-xl shadow-lg transition-all duration-300"
                      title={t("admin.delete")}
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
                          : t("admin.dateUnavailable")}
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
            toast.success(t("admin.addedSuccess"));
          }}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* زر الإضافة العائم المميز */}
      <FloatingAddButton onClick={() => setShowForm(true)} />

      {/* مودال التأكيد الأنيق */}
      <ConfirmModal
        isOpen={!!deleteTargetId}
        title={t("admin.deleteConfirmTitle")}
        description={t("admin.deleteConfirmDescription")}
        confirmText={t("admin.deleteConfirmText")}
        cancelText={t("admin.deleteCancelText")}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </main>
  );
}
