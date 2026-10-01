// components/designs/DesignDetails.tsx
import { IDesign } from "@/interfaces/Design";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FiHeart, FiShare2, FiUser } from "react-icons/fi";

export default function DesignDetails({ design }: { design: IDesign }) {
  const designerName = typeof design.designer === "string" 
    ? design.designer 
    : design.designer?.name || "مصمم غير معروف";

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] text-black dark:text-white py-24 px-6 md:px-12 relative overflow-hidden transition-colors duration-500">
      {/* Decorative Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/3 dark:bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none transition-colors duration-500" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/3 dark:bg-purple-500/5 blur-[120px] rounded-full pointer-events-none transition-colors duration-500" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* SectionHeader الموحد الفاخر لتفاصيل التصميم */}
        <SectionHeader
          align="right"
          badge="تفاصيل العمل الفني"
          title={design.title}
          description={`تم الرفع في ${design.publishedAt ? new Date(design.publishedAt).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" }) : "تاريخ غير متوفر"}`}
          className="mb-12"
        />

        {/* الكانتينر الرئيسي بنمط الـ Glassmorphism الداكن */}
        <div className="bg-gray-100 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden p-6 md:p-10 flex flex-col lg:flex-row gap-12 items-center transition-colors duration-500">
          
          {/* نصف الصورة / الميديا */}
          <div className="w-full lg:w-1/2 relative h-[350px] md:h-[500px] rounded-2xl overflow-hidden border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-black/40 transition-colors duration-500">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={design.media[0]?.url}
              alt={design.title}
              className="w-full h-full object-contain"
            />
          </div>

          {/* نصف النصوص والتفاصيل */}
          <div className="w-full lg:w-1/2 flex flex-col justify-between h-full text-right space-y-6">
            
            {/* معلومات المصمم والتفاعل */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-gray-800 transition-colors duration-500">
              <div className="flex items-center gap-3 justify-end">
                <div>
                  <p className="text-gray-500 dark:text-gray-500 text-xs transition-colors duration-500">صاحب العمل الإبداعي</p>
                  <p className="text-black dark:text-white font-bold text-lg transition-colors duration-500">{designerName}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/10 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 transition-colors duration-500">
                  <FiUser size={18} />
                </div>
              </div>

              <div className="bg-gray-200 dark:bg-white/5 border border-gray-300 dark:border-white/10 px-5 py-2.5 rounded-2xl flex items-center gap-2 transition-colors duration-500">
                <span className="font-bold text-indigo-600 dark:text-indigo-400 transition-colors duration-500">{design.likes} إعجاب</span>
                <FiHeart className="text-red-600 dark:text-red-500 fill-red-600 dark:fill-red-500 transition-colors duration-500" size={16} />
              </div>
            </div>

            {/* وصف التصميم */}
            <div className="space-y-3">
              <h4 className="text-gray-600 dark:text-gray-400 font-semibold text-sm transition-colors duration-500">نبذة عن العمل الفني:</h4>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base md:text-lg transition-colors duration-500">
                {design.description || "لا يوجد وصف متوفر لهذا التصميم حالياً."}
              </p>
            </div>

            {/* الوسوم (Tags) بنمط داكن نيون */}
            {design.tags && design.tags.length > 0 && (
              <div className="space-y-3 pt-4">
                <h4 className="text-gray-600 dark:text-gray-400 font-semibold text-sm transition-colors duration-500">الوسوم والكلمات الدلالية:</h4>
                <div className="flex flex-wrap gap-2 justify-end">
                  {design.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-4 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 rounded-full transition-colors duration-500"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* أزرار الإجراءات (Actions) بنمط موحد */}
            <div className="flex flex-wrap gap-4 pt-6 justify-end">
              <button className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-[0_10px_30px_rgba(79,70,229,0.3)] transition-all">
                تواصل مع المصمم
              </button>
              <button className="flex items-center gap-2 px-6 py-3.5 bg-gray-200 dark:bg-white/5 hover:bg-gray-300 dark:hover:bg-white/10 border border-gray-300 dark:border-white/10 text-black dark:text-white font-bold rounded-xl transition-all duration-500">
                <FiShare2 size={16} />
                مشاركة العمل
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
