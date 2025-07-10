// components/DesignForm/DesignFormCore.tsx
"use client";
import { fetchDesigners } from "./designerService";
import React, { useEffect, useReducer, useRef, useState } from "react";
import { IDesign } from "@/interfaces/Design";
import { DesignFormViewMode, Designer, MediaItem, FormState } from "./Types";
import DesignFloatingToolbar from "./DesignFloatingToolbar";
import DesignEditorBody from "./DesignEditorBody";
import ReactQuill from "react-quill-new";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

// Define the Designer type if not already imported

type DesignFormCoreProps = {
  mode: DesignFormViewMode;
  initialData?: IDesign;
  onSuccess?: () => void;
};

// ----------- أنواع الحالة Action و State -----------

const initialState: FormState = {
  title: "",
  description: "",
  designerId: "",
  tags: [],
  backgroundColor: "",
  mediaItems: [],
  designers: [],
  currentTagInput: "",
  error: "",
  loading: false,
};

type FormAction =
  | {
      type: "SET_FIELD";
      field: keyof Omit<FormState, "mediaItems">;
      value: any;
    }
  | {
      type: "LOAD_INITIAL";
      data: Omit<FormState, "mediaItems"> & { mediaItems: MediaItem[] };
    }
  | { type: "ADD_MEDIA"; items: MediaItem[] }
  | { type: "UPDATE_CAPTION"; index: number; value: string }
  | { type: "REMOVE_MEDIA"; index: number }
  | { type: "UPDATE_PROGRESS"; index: number; progress: number }
  | { type: "SET_LOADING"; loading: boolean }
  | { type: "UPDATE_MEDIA_CAPTION"; index: number; caption: string }
  | { type: "ADD_TAG"; tag: string }
  | { type: "REMOVE_TAG"; index: number }
  | { type: "SET_DESIGNERS"; designers: Designer[] }
  | { type: "SET_ERROR"; message: string }
  | { type: "UPDATE_MEDIA_UPLOADED_URL"; index: number; url: string }
  | { type: "TOGGLE_EDITOR"; index: number }
  | { type: "SHOW_TOOLBAR"; index: number }
  | { type: "HIDE_TOOLBAR"; index: number };

// ----------- Reducer لإدارة الحالة -----------
function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
   
    case "SET_FIELD":
      return {
        ...state,
        [action.field]: action.value,
      };

    case "LOAD_INITIAL":
      return { ...action.data };

    case "ADD_MEDIA":
      return {
        ...state,
        mediaItems: [
          ...state.mediaItems,
          ...action.items.map((item: MediaItem) => ({
            ...item,
            showToolbar: false,
          })),
        ],
        error: "",
      };

    default:
      return state;

    case "REMOVE_MEDIA":
      return {
        ...state,
        mediaItems: state.mediaItems.filter((_, i) => i !== action.index),
      };
    case "UPDATE_MEDIA_CAPTION":
      return {
        ...state,
        mediaItems: state.mediaItems.map((item, i) =>
          i === action.index ? { ...item, caption: action.caption } : item
        ),
      };
    case "UPDATE_MEDIA_UPLOADED_URL":
      return {
        ...state,
        mediaItems: state.mediaItems.map((item, i) =>
          i === action.index ? { ...item, uploadedUrl: action.url } : item
        ),
      };
    case "SET_LOADING":
      return {
        ...state,
        loading: action.loading,
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.message,
      };
    case "ADD_TAG":
      return {
        ...state,
        tags: [...state.tags, action.tag],
      };
    case "REMOVE_TAG":
      return {
        ...state,
        tags: state.tags.filter((_, i) => i !== action.index),
      };
    case "SET_DESIGNERS":
      return {
        ...state,
        designers: action.designers,
      };
    case "SHOW_TOOLBAR":
      return {
        ...state,
        mediaItems: state.mediaItems.map((item, i) =>
          i === action.index ? { ...item, showToolbar: true } : item
        ),
      };

    case "HIDE_TOOLBAR":
      return {
        ...state,
        mediaItems: state.mediaItems.map((item, i) =>
          i === action.index ? { ...item, showToolbar: false } : item
        ),
      };
    case "TOGGLE_EDITOR":
      return {
        ...state,
        mediaItems: state.mediaItems.map((item, i) =>
          i === action.index ? { ...item, showEditor: !item.showEditor } : item
        ),
      };
  }
}

export default function DesignFormCore({
  mode,
  initialData,
  onSuccess,
}: DesignFormCoreProps) {
  const [initialLoadedData, setInitialLoadedData] = useState<FormState | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [state, dispatch] = useReducer(formReducer, initialState);
  const { backgroundColor, mediaItems } = state;
  const editorRef = useRef<ReactQuill>(null);

  // دالة لتحويل الوسائط من البيانات الأولية
  const mapMediaItemsFromInitial = (media: any[]): MediaItem[] => {
    return media.map((item) => ({
      _key: item._key || uuidv4(), // استخدام uuidv4 إذا لم يكن المفتاح موجودًا
      id: item._id || uuidv4(), // استخدام _id أو إنشاء معرف جديد
      file: null, // لا نحتاج الملف هنا لأنه تم رفعه مسبقاً
      previewUrl: item.url,
      type: item.type as MediaItem["type"],
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
    const mapped = {
      title: initialData.title || "",
      description: initialData.description || "",
      designerId: initialData.designer || "",
      tags: (initialData.tags || [])
        .filter((tag: any) => tag && (typeof tag === "string" || tag.title))
        .map((tag: any) => (typeof tag === "string" ? tag : tag.title)),
      backgroundColor: initialData.backgroundColor || "#f9fafb",
      // إذا كان backgroundColor غير موجود، استخدم اللون الافتراضي
      // يمكنك تغيير اللون الافتراضي حسب الحاجة
      designers: [],
    mediaItems: mapMediaItemsFromInitial(initialData.media || []),
      // تحويل الوسائط من البيانات الأولية
      currentTagInput: "",
      error: "",
      loading: false,
    };
    dispatch({
      type: "LOAD_INITIAL",
      data: mapped,
    });
    setInitialLoadedData(mapped);
    }
  }, [initialData]);

  //  تحميل المصممين عند بداية تحميل النموذج
  useEffect(() => {
    async function loadDesigners() {
      try {
        const data = await fetchDesigners();
        dispatch({ type: "SET_DESIGNERS", designers: data });
      } catch (err) {
        console.error("فشل في جلب المصممين");
      }
    }

    loadDesigners();
  }, []);

  // دالة للتعامل مع تغير الحقول
  const handleChange = (
    field: keyof Omit<FormState, "mediaItems">,
    value: any
  ) => {
    if (mode === "view") return; // منع التعديل في وضع العرض فقط
    dispatch({ type: "SET_FIELD", field, value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    const validFiles = files.filter((file) => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        dispatch({
          type: "SET_ERROR",
          message: `الملف ${file.name} يتجاوز الحد الأقصى للحجم (10MB)`,
        });
        return false;
      }
      if (!file.type.match(/image\/.*|video\/.*/)) {
        dispatch({
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

    dispatch({ type: "ADD_MEDIA", items: newItems });
    // بعد قراءة الملفات
    e.target.value = "";
  };

  const handleRemoveMedia = (index: number) => {
    if (mode === "view") return;
    dispatch({ type: "REMOVE_MEDIA", index });
  };

  function handleCaptionChange(index: number, value: string): void {
    if (mode === "view") return;
    dispatch({ type: "UPDATE_MEDIA_CAPTION", index, caption: value });
  }

  function handleRemoveTag(index: number): void {
    if (mode === "view") return;
    dispatch({ type: "REMOVE_TAG", index });
  }

  function handleAddTag(e: React.KeyboardEvent<HTMLInputElement>): void {
    if (mode === "view") return;

    if (e.key === "Enter") {
      e.preventDefault();
      const tag = state.currentTagInput?.trim();
      if (tag && !state.tags.includes(tag)) {
        dispatch({ type: "ADD_TAG", tag });
        dispatch({ type: "SET_FIELD", field: "currentTagInput", value: "" }); // مسح حقل الإدخال بعد الإضافة
      }
    }
  }

  // ============ رفع الملفات ============
  const uploadMediaItems = async () => {
    const uploaded = [];

    for (const [index, item] of mediaItems.entries()) {
      try {
        if (item.uploadedUrl) {
          // إذا الملف مرفوع مسبقاً استخدم الرابط
          uploaded.push({
            _key: item._key ?? uuidv4(), // ✅ استخدام uuidv4 إذا لم يكن المفتاح موجودًا
            _type: "mediaItem", // ✅ إذا كانت سكيم الوسائط معرفًا بهذا النوع (اختياري إذا schema يقبل أي object)
            url: item.uploadedUrl,
            type: item.type,
            caption: item.caption,
          });

          continue;
        }
        const data = new FormData();
        data.append("file", item.file!); // تأكد من أن الملف موجود
        data.append(
          "upload_preset",
          process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
        );

        dispatch({ type: "UPDATE_PROGRESS", index, progress: 0 });

        const cloud = await uploadWithProgress(data, item.type, index);
        if (!cloud || !cloud.secure_url) {
          throw new Error("فشل في رفع الملف إلى Cloudinary");
        }
        dispatch({
          type: "UPDATE_MEDIA_UPLOADED_URL",
          index,
          url: cloud.secure_url,
        });

        uploaded.push({
          _key: item._key ?? uuidv4(),
          url: cloud.secure_url,
          type: item.type,
          caption: item.caption,
        });
      } catch (error) {
        console.error("Upload failed:", error);
        throw error;
      }
    }

    return uploaded;
  };

  const uploadWithProgress = (data: FormData, type: string, index: number) => {
    return new Promise<any>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        const percent = Math.round((e.loaded / e.total) * 100);
        dispatch({ type: "UPDATE_PROGRESS", index, progress: percent });
      });

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(xhr.statusText);
        }
      };

      xhr.onerror = () => reject(xhr.statusText);
      xhr.open(
        "POST",
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${type}/upload`
      );
      xhr.send(data);
    });
  };

  const validateForm = () => {
    if (!state.title.trim()) return "العنوان مطلوب";
    if (!state.designerId) return "الرجاء اختيار مصمم";
    if (mediaItems.length === 0) return "يجب رفع وسائط (صورة أو فيديو)";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    if (state.loading) return;
    e.preventDefault();
    if (mode === "view") return; // منع الإرسال في وضع العرض فقط
    dispatch({ type: "SET_LOADING", loading: true });

    const validation = validateForm();
    if (validation) {
      dispatch({ type: "SET_ERROR", message: validation });
      dispatch({ type: "SET_LOADING", loading: false });
      return;
    }

    dispatch({ type: "SET_LOADING", loading: true });
    dispatch({ type: "SET_ERROR", message: "" });

    try {
      const uploadedMedia = await uploadMediaItems();

      // 🔁 تحويل الوسوم إلى مراجع بعد التأكد من وجودها أو إنشائها
      const tagRefs = await Promise.all(
        state.tags.map(async (tag: string) => {
          try {
            console.log("📎 tagRefs:", tagRefs);

            const res = await fetch("/api/create-tag", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ title: tag }),
            });

            const data = await res.json();

            if (!res.ok || !data._id || typeof data._id !== "string") {
              console.warn("⚠️ وسم غير صالح:", tag, data);
              return null;
            }

            return {
              _type: "reference",
              _ref: data._id,
            };
          } catch (err) {
            console.error("❌ فشل أثناء إنشاء وسم:", tag, err);
            return null;
          }
        })
      );

      // إزالة أي null من المصفوفة
      const validTags = tagRefs.filter(Boolean);

      const res = await fetch(
        initialData ? `/api/designs/${initialData.id}` : "/api/designs",
        {
          method: initialData ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...state,
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
      dispatch({ type: "SET_LOADING", loading: false });
    }
  };
  function resetForm() {
    if (
      confirm(
        "هل تريد حقًا إعادة تعيين النموذج؟ سيتم فقدان جميع التغييرات غير المحفوظة."
      )
    ) {
      dispatch({ type: "LOAD_INITIAL", data: initialLoadedData || initialState });
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
      dispatch({
        type: "SET_FIELD",
        field: "backgroundColor",
        value: initialData.backgroundColor,
      });
    } else if (local) {
      dispatch({ type: "SET_FIELD", field: "backgroundColor", value: local });
    }
  }, [initialData]);
  // دالة للتحقق مما إذا كان اللون داكنًا
  function isDarkColor(hex: string) {
    const r = parseInt(hex.substr(1, 2), 16);
    const g = parseInt(hex.substr(3, 2), 16);
    const b = parseInt(hex.substr(5, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 128; // أقل من 128 تعتبر داكنة
  }

  return (
    <motion.div
      className="flex flex-col  md:flex-row h-full justify-center"
      style={{
        backgroundColor: state.backgroundColor,
        color: isDarkColor(state.backgroundColor) ? "white" : "black",
      }}
    >
      <DesignEditorBody
        mode={mode}
        bgColor={state.backgroundColor}
        formData={state}
        handleInputChange={handleInputChange}
        handleFileChange={handleFileChange}
        mediaItems={state.mediaItems}
        handleCaptionChange={handleCaptionChange}
        dispatch={dispatch}
        editorRef={editorRef}
        toolbarFocused={false}
        designers={state.designers}
        handleRemoveTag={handleRemoveTag}
        handleAddTag={handleAddTag}
      />

      <DesignFloatingToolbar
        formData={state}
        dispatch={dispatch}
        bgColor={state.backgroundColor}
        setBgColor={(color) =>
          dispatch({
            type: "SET_FIELD",
            field: "backgroundColor",
            value: color,
          })
        }
        handleSubmit={handleSubmit}
        loading={state.loading}
        error={state.error}
        success={success}
        initialData={initialData}
        resetForm={resetForm}
        mode={mode}
      />
    </motion.div>
  );
}
