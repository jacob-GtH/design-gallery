"use client"; // يتيح استخدام React Hooks في هذه الصفحة

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { IDesign } from "@/interfaces/Design";
import DesignFormPage from "@/components/designform/DesignFormPage";
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

  if (loading) return <p className="p-4">جارٍ تحميل التصميم...</p>;
  if (!design) return <p className="p-4 text-red-500">تعذر تحميل التصميم</p>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6 lg:px-40">
      <DesignFormPage
        mode="edit"
        initialData={design}
        onSuccess={() => {
          toast("تم التحديث", { description: "تم تعديل التصميم بنجاح" });
          router.push(`/designs/${design.id}`);
        }}
      />
    </div>
  );
}
