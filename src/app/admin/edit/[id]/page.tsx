"use client"; // يتيح استخدام React Hooks في هذه الصفحة

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { IDesign } from "@/interfaces/Design";
import DesignFormPage from "@/components/admin/DesignFormPage";
import { toast } from "sonner";

export default function EditPage() {
  const { id } = useParams(); // الحصول على 'id' من الرابط
  const router = useRouter();

  const [design, setDesign] = useState<IDesign | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDesign = async () => {
      const res = await fetch(`/api/designs/${id}`);
      if (res.ok) {
        const data = await res.json();
        setDesign(data);
      }
      setLoading(false);
    };

    if (id) fetchDesign();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#050505] flex flex-col items-center justify-center gap-4 text-black dark:text-white transition-colors duration-500">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600 dark:text-gray-400">جاري تحميل بيانات التصميم للتعديل...</p>
      </div>
    );
  }
  
  if (!design) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#050505] flex items-center justify-center text-black dark:text-white transition-colors duration-500">
        <p className="p-4 text-red-500 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl transition-colors duration-500">تعذر تحميل التصميم</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] text-black dark:text-white py-10 px-6 lg:px-40 relative overflow-hidden transition-colors duration-500">
      {/* Decorative Background Glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/3 dark:bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none transition-colors duration-500" />
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-purple-500/3 dark:bg-purple-500/5 blur-[120px] rounded-full pointer-events-none transition-colors duration-500" />

      <div className="relative z-10">
        <DesignFormPage
          mode="edit"
          initialData={design}
          onSuccess={() => {
            toast.success("تم تعديل التصميم بنجاح");
            router.push(`/admin/view/${design.id}`);
          }}
          onClose={() => router.push("/admin")}
        />
      </div>
    </div>
  );
}
