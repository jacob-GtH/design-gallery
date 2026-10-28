// components/admin/DesignFormCore.tsx
"use client";

import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Loader2, X } from "lucide-react";
import type { IDesign } from "@/interfaces/Design";
import { formReducer } from "@/hooks/formAction";
import { blocksReducer } from "@/hooks/blocksReducer";
import { uploadBlocks } from "@/hooks/useMediaUpload";
import { getOrCreateTag } from "@/lib/actions";
import { effectiveCoverKey } from "@/lib/cover";
import { isDarkColor } from "@/lib/utils/colorUtils";
import { blocksFromPersisted, isVisualBlock } from "@/components/editor/blockFactory";
import { ActiveEditorProvider } from "@/components/editor/EditorContext";
import FormatToolbar from "@/components/editor/FormatToolbar";
import BlocksEditor from "@/components/editor/BlocksEditor";
import SettingsPanel from "@/components/editor/SettingsPanel";
import { fetchDesigners } from "./designerService";
import type { Block, DesignFormViewMode, FormState } from "./Types";

type Props = {
  mode: DesignFormViewMode;
  initialData?: IDesign;
  modeTitle: string;
  onSuccess?: () => void;
  onClose?: () => void;
};

const LOCAL_DRAFT_KEY = "designFormDraft";

const initialForm: FormState = {
  title: "",
  description: "",
  designerId: "",
  tags: [],
  backgroundColor: "#f9fafb",
  coverKey: "",
  designers: [],
  currentTagInput: "",
  error: "",
  loading: false,
};

type Status = "draft" | "published";

export default function DesignFormCore({ mode, initialData, modeTitle, onSuccess, onClose }: Props) {
  const { t } = useTranslation();
  const [form, formDispatch] = useReducer(formReducer, initialForm);
  const [blocks, blocksDispatch] = useReducer(blocksReducer, [] as Block[]);
  const [version, setVersion] = useState(0);
  const snapshot = useRef<{ form: Partial<FormState>; blocks: Block[] }>({ form: {}, blocks: [] });

  const readOnly = mode === "view";
  const isEdit = mode === "edit" && !!initialData;
  const wasPublished = isEdit && (initialData?.status ?? "published") === "published";
  const dark = isDarkColor(form.backgroundColor);

  // ---------- تحميل البيانات الأولية (تعديل/عرض) ----------
  useEffect(() => {
    if (!initialData) return;
    const loaded = blocksFromPersisted(initialData.media);
    const data: Partial<FormState> = {
      title: initialData.title || "",
      description: initialData.description || "",
      designerId:
        typeof initialData.designer === "string"
          ? initialData.designer
          : initialData.designer?._id || "",
      tags: (initialData.tags ?? []).filter((x): x is string => typeof x === "string"),
      backgroundColor: initialData.backgroundColor || "#f9fafb",
      coverKey: initialData.coverKey ?? "",
      currentTagInput: "",
      error: "",
    };
    formDispatch({ type: "LOAD_INITIAL", data });
    blocksDispatch({ type: "SET", blocks: loaded });
    snapshot.current = { form: data, blocks: loaded };
    setVersion((v) => v + 1);
  }, [initialData]);

  // ---------- المصممون ----------
  useEffect(() => {
    fetchDesigners()
      .then((designers) => formDispatch({ type: "SET_DESIGNERS", designers }))
      .catch((err) => console.error("فشل في جلب المصممين", err));
  }, []);

  // ---------- مسودة محلية تلقائية (حقول النموذج فقط) ----------
  useEffect(() => {
    if (mode !== "create") return;
    if (!form.title && !form.description && blocks.length === 0) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(
          LOCAL_DRAFT_KEY,
          JSON.stringify({
            title: form.title,
            description: form.description,
            designerId: form.designerId,
            tags: form.tags,
            backgroundColor: form.backgroundColor,
            savedAt: new Date().toISOString(),
          })
        );
      } catch {}
    }, 10000);
    return () => clearTimeout(timer);
  }, [form.title, form.description, form.designerId, form.tags, form.backgroundColor, blocks.length, mode]);

  useEffect(() => {
    if (mode !== "create" || initialData) return;
    try {
      const raw = localStorage.getItem(LOCAL_DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw);
      if (draft.title || draft.description || draft.tags?.length > 0) {
        formDispatch({
          type: "LOAD_INITIAL",
          data: {
            title: draft.title || "",
            description: draft.description || "",
            designerId: draft.designerId || "",
            tags: Array.isArray(draft.tags) ? draft.tags : [],
            backgroundColor: draft.backgroundColor || "#f9fafb",
          },
        });
        toast.info(t("admin.draftRestored"));
      }
    } catch (err) {
      console.error("فشل استرجاع المسودة:", err);
    }
  }, [mode, initialData, t]);

  // ---------- الغلاف ----------
  const coverKey = useMemo(() => effectiveCoverKey(blocks, form.coverKey), [blocks, form.coverKey]);

  // ---------- الأخطاء ----------
  const showError = (message: string) => {
    formDispatch({ type: "SET_ERROR", message });
    toast.error(message);
  };

  const validate = (status: Status): string => {
    if (!form.title.trim()) return t("formErrors.titleRequired");
    if (status === "published") {
      if (!form.designerId) return t("formErrors.designerRequired");
      if (!blocks.some(isVisualBlock)) return t("formErrors.visualRequired");
    }
    return "";
  };

  // ---------- الحفظ ----------
  const submit = async (status: Status) => {
    if (readOnly || form.loading) return;

    const problem = validate(status);
    if (problem) {
      showError(problem);
      return;
    }
    if (status === "draft" && wasPublished && !window.confirm(t("editor.confirmUnpublish"))) return;

    formDispatch({ type: "SET_ERROR", message: "" });
    formDispatch({ type: "SET_LOADING", loading: true });

    try {
      const media = await uploadBlocks(blocks, blocksDispatch);

      const refs = await Promise.all(form.tags.map((tag) => getOrCreateTag(tag)));
      if (refs.some((r) => !r)) throw new Error(t("formErrors.tagError"));

      const chosenCover =
        form.coverKey && blocks.some((b) => b._key === form.coverKey && isVisualBlock(b))
          ? form.coverKey
          : null;

      const body = {
        title: form.title.trim(),
        description: form.description,
        designerId: form.designerId || undefined,
        backgroundColor: form.backgroundColor,
        tags: refs,
        media,
        coverKey: chosenCover,
        status,
      };

      const res = await fetch(isEdit ? `/api/designs/${initialData!.id}` : "/api/designs", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        let serverMsg = "";
        try {
          serverMsg = (await res.json())?.error ?? "";
        } catch {}
        throw new Error(
          res.status === 401 ? t("formErrors.sessionExpired") : serverMsg || t("formErrors.saveError")
        );
      }

      try {
        localStorage.removeItem(LOCAL_DRAFT_KEY);
      } catch {}
      toast.success(
        status === "draft"
          ? t("editor.draftSaved")
          : isEdit
            ? t("formErrors.updateSuccess")
            : t("admin.addedSuccess")
      );
      onSuccess?.();
    } catch (err) {
      showError(err instanceof Error && err.message ? err.message : t("formErrors.saveError"));
    } finally {
      formDispatch({ type: "SET_LOADING", loading: false });
    }
  };

  const resetForm = () => {
    if (readOnly || !window.confirm(t("editor.confirmReset"))) return;
    formDispatch({
      type: "LOAD_INITIAL",
      data: {
        title: "",
        description: "",
        designerId: "",
        tags: [],
        backgroundColor: "#f9fafb",
        coverKey: "",
        currentTagInput: "",
        error: "",
        ...snapshot.current.form,
      },
    });
    blocksDispatch({ type: "SET", blocks: snapshot.current.blocks });
    setVersion((v) => v + 1);
    try {
      localStorage.removeItem(LOCAL_DRAFT_KEY);
    } catch {}
  };

  const statusLabel = isEdit
    ? (initialData?.status ?? "published") === "draft"
      ? t("admin.draftBadge")
      : t("editor.published")
    : "";

  return (
    <ActiveEditorProvider>
      <div className="flex min-h-full flex-col bg-neutral-100 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
        {/* ---------- الرأس ---------- */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b border-black/10 bg-white/90 px-2 backdrop-blur sm:px-4 dark:border-white/10 dark:bg-neutral-900/90">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              aria-label={t("admin.close")}
              title={t("admin.close")}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
            >
              <X size={20} />
            </button>
            <h1 className="hidden truncate text-base font-bold sm:block">{modeTitle}</h1>
            {statusLabel && (
              <span className="shrink-0 rounded-full bg-amber-400/90 px-2.5 py-0.5 text-xs font-bold text-black">
                {statusLabel}
              </span>
            )}
          </div>

          {!readOnly && (
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                disabled={form.loading}
                onClick={() => submit("draft")}
                className="rounded-lg border border-black/15 px-3 py-2 text-sm font-medium hover:bg-black/5 disabled:opacity-50 dark:border-white/20 dark:hover:bg-white/10"
              >
                {wasPublished ? t("editor.unpublish") : t("editor.saveDraft")}
              </button>
              <button
                type="button"
                disabled={form.loading}
                onClick={() => submit("published")}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-500 disabled:opacity-60"
              >
                {form.loading && <Loader2 size={16} className="animate-spin" />}
                {wasPublished ? t("admin.saveChanges") : t("admin.publishDesign")}
              </button>
            </div>
          )}
        </header>

        {/* ---------- شريط التنسيق الواحد ---------- */}
        {!readOnly && (
          <div className="sticky top-14 z-20 px-2 pt-2 sm:px-4">
            <div className="mx-auto max-w-6xl">
              <FormatToolbar />
            </div>
          </div>
        )}

        {form.error && (
          <p
            role="alert"
            className="mx-auto mt-3 w-full max-w-6xl rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300"
          >
            {form.error}
          </p>
        )}

        <div className="mx-auto grid w-full max-w-6xl flex-1 gap-4 px-2 py-4 pb-24 sm:px-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-6">
          {/* ---------- منطقة المحتوى ---------- */}
          <main
            className={`min-w-0 rounded-2xl p-3 shadow-sm transition-colors sm:p-6 ${dark ? "text-white" : "text-gray-900"}`}
            style={{ backgroundColor: form.backgroundColor }}
          >
            <input
              type="text"
              dir="auto"
              value={form.title}
              readOnly={readOnly}
              maxLength={200}
              placeholder={t("admin.projectTitle")}
              aria-label={t("admin.projectTitle")}
              onChange={(e) => formDispatch({ type: "SET_FIELD", field: "title", value: e.target.value })}
              className="w-full bg-transparent px-2 py-2 text-3xl font-bold outline-none placeholder:opacity-40 sm:text-4xl"
            />
            <textarea
              dir="auto"
              value={form.description}
              readOnly={readOnly}
              rows={2}
              maxLength={5000}
              placeholder={t("admin.projectDescription")}
              aria-label={t("admin.projectDescription")}
              onChange={(e) => formDispatch({ type: "SET_FIELD", field: "description", value: e.target.value })}
              className="mb-4 w-full resize-y bg-transparent px-2 py-2 text-base outline-none placeholder:opacity-40"
            />

            <BlocksEditor
              blocks={blocks}
              dispatch={blocksDispatch}
              readOnly={readOnly}
              coverKey={coverKey}
              onSetCover={(key) => formDispatch({ type: "SET_FIELD", field: "coverKey", value: key })}
              version={version}
              onError={showError}
            />
          </main>

          {/* ---------- الإعدادات (تحت المحتوى على الموبايل) ---------- */}
          <aside className="lg:sticky lg:top-[7.5rem] lg:self-start">
            <SettingsPanel
              readOnly={readOnly}
              designers={form.designers}
              designerId={form.designerId}
              onDesigner={(id) => formDispatch({ type: "SET_FIELD", field: "designerId", value: id })}
              tags={form.tags}
              tagInput={form.currentTagInput}
              onTagInput={(v) => formDispatch({ type: "SET_FIELD", field: "currentTagInput", value: v })}
              onAddTag={(tag) => formDispatch({ type: "ADD_TAG", tag })}
              onRemoveTag={(index) => formDispatch({ type: "REMOVE_TAG", index })}
              backgroundColor={form.backgroundColor}
              onBackground={(c) => formDispatch({ type: "SET_FIELD", field: "backgroundColor", value: c })}
              createdAt={initialData?.createdAt}
              onReset={resetForm}
            />
          </aside>
        </div>
      </div>
    </ActiveEditorProvider>
  );
}
