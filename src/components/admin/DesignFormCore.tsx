// components/DesignForm/DesignFormCore.tsx
"use client";
import React, {
  Suspense,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { IDesign } from "@/interfaces/Design";
import ReactQuill from "react-quill-new";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { isDarkColor } from "@/lib/utils/colorUtils";
import { client } from "@/sanity/design-cms/lib/client";
import { getOrCreateTag } from "@/lib/actions";

import { fetchDesigners } from "@/components/admin/designerService";
import { formReducer } from "@/hooks/formAction";
import { mediaReducer } from "@/hooks/mediaAction";
import { uploadMediaItems } from "@/hooks/useMediaUpload";
import { DesignFormViewMode, MediaItem, FormState } from "./Types";
import DesignEditorBody from "@/components/admin/DesignEditorBody";


type DesignFormCoreProps = {
  mode: DesignFormViewMode;
  initialData?: IDesign;
  onSuccess?: () => void;
};
// ----------- أنواع الحالة Action و State -----------
const initialFormState: FormState = {
  title: "",
  description: "",
  designerId: "",
  tags: [],
  backgroundColor: "#f9fafb",
  mediaItems: [],
  designers: [],
  currentTagInput: "",
  error: "",
  loading: false,
};
const initialMediaState: MediaItem[] = [];
// ----------- مكون DesignFormCore -----------
// هذا المكون هو الجزء الأساسي من نموذج التصميم
// حيث يتم إدارة الحالة وتقديم الوظائف الأساسية للنموذج
// يتم استخدامه في وضع العرض أو التعديل
// بناءً على قيمة `mode` الممررة إليه
// يمكن استخدامه لعرض التصميمات أو تعديلها
// أو إضافة تصميم جديد
// يتم استخدامه في صفحة تصميمات الإدارة
// ويمكن استخدامه في أي مكان آخر يحتاج إلى نموذج تصميم
const DesignFloatingToolbar = React.lazy(
  () => import("@/components/admin/DesignFloatingToolbar")
);

export default function DesignFormCore({
  mode,
  initialData,
  onSuccess,
}: DesignFormCoreProps) {
  const [initialLoadedData, setInitialLoadedData] = useState<FormState | null>(
    null
  );
  const [success, setSuccess] = React.useState(false);
  const [formState, formDispatch] = useReducer(formReducer, initialFormState);
  const [mediaItems, mediaDispatch] = useReducer(
    mediaReducer,
    initialMediaState
  );
  const { backgroundColor } = formState;
  const editorRef = useRef<ReactQuill>(null);

  // مزامنة mediaItems في formState كلما تغير mediaItems
  useEffect(() => {
    formDispatch({
      type: "SET_FIELD",
      field: "mediaItems",
      value: mediaItems,
    });
  }, [mediaItems]);

  // دالة لتحويل الوسائط من البيانات الأولية
  const mapMediaItemsFromInitial = (media: { _key?: string; _id?: string; url: string; type: "image" | "video"; caption?: string }[]): MediaItem[] => {
    return media.map((item) => ({
      _key: item._key || uuidv4(), // استخدام uuidv4 إذا لم يكن المفتاح موجودًا
      id: item._id || uuidv4(), // استخدام _id أو إنشاء معرف جديد
      file: null, // لا نحتاج الملف هنا لأنه تم رفعه مسبقاً
      previewUrl: item.url,
      type: item.type,
      caption: item.caption || "",
      uploadProgress: undefined, // لا نحتاج التقدم هنا لأنه تم رفعه مسبقاً
      showToolbar: false,
      showEditor: false,
      timeoutId: undefined,
      uploadedUrl: item.url, // تخزين الرابط المرفوع
    }));
  };

  // تحميل البيانات الأولية عند وجود initialData
  useEffect(() => {
    if (initialData) {
      const mappedMedia = mapMediaItemsFromInitial(initialData.media || [])
      const mapped = {
        title: initialData.title || "",
        description: initialData.description || "",
        designerId: typeof initialData.designer === "string" ? initialData.designer : initialData.designer?._id || "",
        tags: (initialData.tags as (string | { title: string })[] || [])
          .filter((tag) => tag && (typeof tag === "string" || (typeof tag === "object" && "title" in tag)))
          .map((tag) => (typeof tag === "string" ? tag : tag.title)),
        backgroundColor: initialData.backgroundColor || "#f9fafb",
        // إذا كان backgroundColor غير موجود، استخدم اللون الافتراضي
        // يمكنك تغيير اللون الافتراضي حسب الحاجة
        designers: [],
        mediaItems: mappedMedia,
        // تحويل الوسائط من البيانات الأولية
        currentTagInput: "",
        error: "",
        loading: false,
      };
      formDispatch({
        type: "LOAD_INITIAL",
        data: mapped,
      });
      setInitialLoadedData(mapped);
      mediaDispatch({ type: "SET_MEDIA", items: mappedMedia }); // تحديث حالة mediaItems
    }
  }, [initialData]);

  //  تحميل المصممين عند بداية تحميل النموذج
  useEffect(() => {
    const loadDesigners = async () => {
      try {
        const data = await fetchDesigners();
        formDispatch({ type: "SET_DESIGNERS", designers: data });
      } catch (err) {
        console.error("فشل في جلب المصممين", err);
      }
    };
    loadDesigners();
  }, []);

  // دالة للتعامل مع تغير الحقول
  const handleChange = <K extends keyof Omit<FormState, "mediaItems">>(
    field: K,
    value: FormState[K]
  ) => {
    if (mode === "view") return; // منع التعديل في وضع العرض فقط
    formDispatch({ type: "SET_FIELD", field, value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    const validFiles = files.filter((file) => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        formDispatch({
          type: "SET_ERROR",
          message: `الملف ${file.name} يتجاوز الحد الأقصى للحجم (10MB)`,
        });
        return false;
      }
      if (!file.type.match(/image\/.*|video\/.*/)) {
        formDispatch({
          type: "SET_ERROR",
          message: `نوع الملف ${file.name} غير مدعوم`,
        });
        return false;
      }
      return true;
    });

    const newItems = validFiles.map((file) => ({
      _key: uuidv4(), // استخدام uuidv4 لإنشاء مفتاح فريد
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
      file,
      previewUrl: URL.createObjectURL(file),
      type: file.type.startsWith("video")
        ? ("video" as const)
        : ("image" as const),
      caption: "",
      uploadProgress: undefined,
      showToolbar: false,
    }));

    mediaDispatch({ type: "ADD_MEDIA", items: newItems });
    // بعد قراءة الملفات
    e.target.value = "";
  };

  function handleCaptionChange(index: number, value: string): void {
    if (mode === "view") return;
    mediaDispatch({ type: "UPDATE_CAPTION", index, caption: value });
  }

  function handleRemoveTag(index: number): void {
    if (mode === "view") return;
    formDispatch({ type: "REMOVE_TAG", index });
  }

  function handleAddTag(e: React.KeyboardEvent<HTMLInputElement>): void {
    if (mode === "view") return;

    if (e.key === "Enter") {
      e.preventDefault();
      const tag = formState.currentTagInput?.trim();
      if (tag && !formState.tags.includes(tag)) {
        formDispatch({ type: "ADD_TAG", tag });
        formDispatch({
          type: "SET_FIELD",
          field: "currentTagInput",
          value: "",
        }); // مسح حقل الإدخال بعد الإضافة
      }
    }
  }

  // ============ رفع الملفات ============

  const validateForm = () => {
    if (!formState.title.trim()) return "العنوان مطلوب";
    if (!formState.designerId) return "الرجاء اختيار مصمم";
    if (mediaItems.length === 0) return "يجب رفع وسائط (صورة أو فيديو)";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    if (formState.loading) return;
    e.preventDefault();
    if (mode === "view") return; // منع الإرسال في وضع العرض فقط
    formDispatch({ type: "SET_LOADING", loading: true });

    const validation = validateForm();
    if (validation) {
      formDispatch({ type: "SET_ERROR", message: validation });
      formDispatch({ type: "SET_LOADING", loading: false });
      return;
    }

    formDispatch({ type: "SET_LOADING", loading: true });
    formDispatch({ type: "SET_ERROR", message: "" });

    try {
      const uploadedMedia = await uploadMediaItems(mediaItems, mediaDispatch);

      // 🔁 تحويل الوسوم إلى مراجع بعد التأكد من وجودها أو إنشائها
      const tagRefs = await Promise.all(
        formState.tags.map(async (tag: string) => {
          return await getOrCreateTag(tag);
        })
      );

      const validTags = tagRefs.filter(Boolean);

     // 🌟 تجهيز البيانات الأساسية فقط ومنع إرسال حقول الواجهة المشوهة
 

      const res = await fetch(
        initialData ? `/api/designs/${initialData.id}` : "/api/designs",
        {
          method: initialData ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formState,
            tags: validTags, // ← تم استبدالها بالمراجع الصحيحة
            media: uploadedMedia,
            publishedAt: new Date().toISOString(),
          }),
        }
      );
      if (!res.ok) throw new Error(await res.text());

      toast.success(initialData ? "تم التحديث بنجاح" : "تم الإضافة بنجاح");
      localStorage.removeItem("designFormDraft");

      if (onSuccess) await onSuccess();
    } catch (err) {
      console.error("Submit error:", err);
      toast.error("حدث خطأ أثناء الحفظ");
    } finally {
      formDispatch({ type: "SET_LOADING", loading: false });
    }
  };
  function resetForm() {
    if (
      confirm(
        "هل تريد حقًا إعادة تعيين النموذج؟ سيتم فقدان جميع التغييرات غير المحفوظة."
      )
    ) {
      formDispatch({
        type: "LOAD_INITIAL",
        data: initialLoadedData || initialFormState,
      });
      localStorage.removeItem("designFormDraft");
      setSuccess(false);
    }
  }
  // هذه الدالة الجديدة تتوافق مع التوقيع المطلوب من DesignEditorBody
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    handleChange(name as keyof Omit<FormState, "mediaItems">, value);
  };

  useEffect(() => {
    const local = localStorage.getItem("backgroundColor");
    if (initialData?.backgroundColor) {
      formDispatch({
        type: "SET_FIELD",
        field: "backgroundColor",
        value: initialData.backgroundColor,
      });
    } else if (local) {
      formDispatch({
        type: "SET_FIELD",
        field: "backgroundColor",
        value: local,
      });
    }
  }, [initialData]);

  return (
    <motion.div
      className="flex flex-col md:flex-row h-full justify-center"
      style={{
        backgroundColor,
        color: isDarkColor(backgroundColor) ? "white" : "black",
      }}
    >
      <DesignEditorBody
        mode={mode}
        bgColor={backgroundColor}
        formData={formState}
        handleInputChange={handleInputChange}
        handleFileChange={handleFileChange}
        mediaItems={mediaItems}
        handleCaptionChange={handleCaptionChange}
        dispatch={mediaDispatch}
        formDispatch={formDispatch}
        editorRef={editorRef}
        toolbarFocused={false}
        designers={formState.designers}
        handleRemoveTag={handleRemoveTag}
        handleAddTag={handleAddTag}
      />
      <Suspense
        fallback={<div className="text-center p-2">Loading toolbar...</div>}
      >
        <DesignFloatingToolbar
          formData={formState}
          dispatch={formDispatch}
          bgColor={backgroundColor}
          setBgColor={(color) => handleChange("backgroundColor", color)}
          handleSubmit={handleSubmit}
          loading={formState.loading}
          error={formState.error}
          success={success}
          initialData={initialData}
          resetForm={resetForm}
          mode={mode}
        />
      </Suspense>
    </motion.div>
  );
}
