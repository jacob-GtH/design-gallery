// components/DesignForm/DesignFormCore.tsx
"use client";
import { fetchDesigners } from "./designerService";

import { TagInput } from "./subcomponents/TagInput";
import { MediaItemComponent } from "./subcomponents/MediaItem";
import React, { useEffect, useReducer, useRef } from "react";
import { IDesign } from "@/interfaces/Design";
import { DesignFormViewMode, Designer, MediaItem } from "./Types";
import { FloatingToolbar } from "../editor/FloatingToolbar";
import DesignFloatingToolbar from "./DesignFloatingToolbar";
import DesignEditorBody from "./DesignEditorBody";
import ReactQuill from "react-quill-new";
import { motion } from "framer-motion";

// Define the Designer type if not already imported

type DesignFormCoreProps = {
  mode: DesignFormViewMode;
  initialData?: IDesign;
  onSuccess?: () => void;
};

// ----------- أنواع الحالة Action و State -----------
type FormState = {
  title: string;
  description: string;
  designerId: string;
  tags: string[];
  backgroundColor: string;
  mediaItems: MediaItem[];
  designers: Designer[];
  currentTagInput: string;
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
  | { type: "REMOVE_MEDIA"; index: number }
  | { type: "UPDATE_MEDIA_CAPTION"; index: number; caption: string }
  | { type: "ADD_TAG"; tag: string }
  | { type: "REMOVE_TAG"; index: number }
  | { type: "SET_DESIGNERS"; designers: Designer[] };

const initialState: FormState = {
  title: "",
  description: "",
  designerId: "",
  tags: [],
  backgroundColor: "#f9fafb",
  mediaItems: [],
  designers: [],
  currentTagInput: "",
};

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
        mediaItems: [...state.mediaItems, ...action.items],
      };
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

    default:
      return state;
  }
}

export default function DesignFormCore({
  mode,
  initialData,
  onSuccess,
}: DesignFormCoreProps) {
  const [state, dispatch] = useReducer(formReducer, initialState);
  const { title, description, designerId, tags, backgroundColor } = state;
  const editorRef = useRef<ReactQuill>(null);

  // تحميل البيانات الأولية عند وجود initialData
  useEffect(() => {
    if (initialData) {
      dispatch({
        type: "LOAD_INITIAL",
        data: {
          title: initialData.title || "",
          description: initialData.description || "",
          designerId: initialData.designer || "",
          tags: initialData.tags || [],
          backgroundColor:
            "backgroundColor" in initialData &&
            (initialData as any).backgroundColor
              ? (initialData as any).backgroundColor
              : "#f9fafb",
          designers: [],
          mediaItems: (initialData as any).mediaItems || [],
          currentTagInput: "",
        },
      });
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

  const handleAddMedia = (files: FileList | null) => {
    if (!files) return;
    const newItems: MediaItem[] = Array.from(files).map((file) => ({
      id: `${file.name}-${Date.now()}`,
      file,
      previewUrl: URL.createObjectURL(file),
      type: file.type.startsWith("video") ? "video" : "image",
      caption: "",
    }));

    dispatch({ type: "ADD_MEDIA", items: newItems });
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

  function setBgColor(color: string): void {
    if (mode === "view") return;
    dispatch({ type: "SET_FIELD", field: "backgroundColor", value: color });
  }
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  async function handleSubmit(): Promise<void> {
    if (mode === "view") return;
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Prepare form data
      const formData = new FormData();
      formData.append("title", state.title);
      formData.append("description", state.description);
      formData.append("designer", state.designerId);
      formData.append("backgroundColor", state.backgroundColor);
      state.tags.forEach((tag, i) => formData.append(`tags[${i}]`, tag));
      state.mediaItems.forEach((item, i) => {
        if (item.file) {
          formData.append(`media[${i}]`, item.file);
        }
        formData.append(`mediaCaptions[${i}]`, item.caption || "");
        formData.append(`mediaTypes[${i}]`, item.type);
      });

      // Choose endpoint based on mode
      const endpoint =
        mode === "edit"
          ? `/api/designs/${(initialData as any)?._id}`
          : "/api/designs";
      const method = mode === "edit" ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        body: formData,
      });

      if (!res.ok) {
        const errMsg = await res.text();
        throw new Error(errMsg || "فشل حفظ التصميم");
      }

      setSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    dispatch({ type: "LOAD_INITIAL", data: initialState });
    setError(null);
    setSuccess(false);
  }
  // هذه الدالة الجديدة تتوافق مع التوقيع المطلوب من DesignEditorBody
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    handleChange(name as keyof Omit<FormState, "mediaItems">, value);
  };
 
  return (
    <motion.div>
      <div
        className="flex flex-col md:flex-row h-full pb-6 justify-center rounded-3xl"
      
      ></div>
      <DesignEditorBody
        mode={mode}
        bgColor={backgroundColor}
        formData={state}
        handleInputChange={handleChange}
        handleAddMedia={handleAddMedia}
        mediaItems={state.mediaItems}
        handleCaptionChange={handleCaptionChange}
        dispatch={dispatch}
        editorRef={editorRef}
        modules={module}
        toolbarFocused={false}
        designers={state.designers}
        handleRemoveTag={handleRemoveTag}
        handleAddTag={handleAddTag}
      />

      <DesignFloatingToolbar
        formData={state}
        dispatch={dispatch}
        bgColor={backgroundColor}
        setBgColor={setBgColor}
        handleSubmit={handleSubmit}
        loading={loading}
        error={error ?? ""}
        success={success}
        initialData={initialData}
        resetForm={resetForm}
      />
    </motion.div>
  );
}

{
  /* 
     <form>
        <div>
          {mode === "view" ? (
            <p>{state.title || "—"}</p>
          ) : (
            <input
              type="text"
              id="title"
              placeholder="اسم المشروع..."
              value={state.title}
              onChange={(e) =>
                dispatch({
                  type: "SET_FIELD",
                  field: "title",
                  value: e.target.value,
                })
              }
              className="w-full text-3xl font-bold p-2 mb-4 text-center border-none focus:outline-none bg-transparent"
            />
          )}
        </div>
        <div>
          {mode === "view" ? (
            <p>{state.description || "—"}</p>
          ) : (
            <textarea
              id="description"
              placeholder="وصف المشروع..."
              value={state.description}
              onChange={(e) =>
                dispatch({
                  type: "SET_FIELD",
                  field: "description",
                  value: e.target.value,
                })
              }
              className="w-full p-2 mb-2 border-none text-center focus:outline-none bg-transparent min-h-[60px] "
            />
          )}
        </div>

        {/* رفع ملفات الوسائط *
        <div className="space-y-0">
          {(mode === "create" || mode === "edit") && (
            <div>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={(e) => handleAddMedia(e.target.files)}
              />
              
            </div>
          )}
          {/* عرض الوسائط *
          <div>
            {state.mediaItems.map((item, index) => (
              <MediaItemComponent
                key={item.id}
                item={item}
                index={index}
                mode={mode}
                onUpdateCaption={handleUpdateCaption}
                onRemove={mode !== "view" ? handleRemoveMedia : undefined}
              />
            ))}
          </div>
        </div>

        <div>
          <TagInput
            tags={state.tags}
            onAdd={(tag) => dispatch({ type: "ADD_TAG", tag })}
            onRemove={(index) => dispatch({ type: "REMOVE_TAG", index })}
            disabled={mode === "view"}
          />
        </div>

        <div>
          <label htmlFor="bgColor">لون الخلفية:</label>
          {mode === "view" ? (
            <div
              style={{
                backgroundColor: state.backgroundColor,
                width: "80px",
                height: "30px",
                border: "1px solid #ccc",
              }}
            />
          ) : (
            <input
              type="color"
              id="bgColor"
              value={state.backgroundColor}
              onChange={(e) =>
                dispatch({
                  type: "SET_FIELD",
                  field: "backgroundColor",
                  value: e.target.value,
                })
              }
            />
          )}
        </div>

        {/* باقي الحقول هنا *
        <div>
          <label htmlFor="designer">اختر المصمم:</label>
          {mode === "view" ? (
            <p>
              {state.designers.find((d) => d._id === state.designerId)?.name ||
                "غير معروف"}
            </p>
          ) : (
            <select
              id="designer"
              value={state.designerId}
              onChange={(e) =>
                dispatch({
                  type: "SET_FIELD",
                  field: "designerId",
                  value: e.target.value,
                })
              }
            >
              <option value="">-- اختر --</option>
              {state.designers.map((designer) => (
                <option key={designer._id} value={designer._id}>
                  {designer.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* زر حفظ أو تعديل فقط في create/edit *
        {(mode === "create" || mode === "edit") && (
          <button type="submit">حفظ</button>
        )}
      </form>
     */
}
