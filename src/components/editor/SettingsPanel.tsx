// components/editor/SettingsPanel.tsx
"use client";

import type { KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { Calendar, RotateCcw, X } from "lucide-react";
import type { Designer } from "@/components/admin/Types";

type Props = {
  readOnly: boolean;
  designers: Designer[];
  designerId: string;
  onDesigner: (id: string) => void;
  tags: string[];
  tagInput: string;
  onTagInput: (v: string) => void;
  onAddTag: (tag: string) => void;
  onRemoveTag: (index: number) => void;
  backgroundColor: string;
  onBackground: (color: string) => void;
  createdAt?: string;
  onReset?: () => void;
};

const MAX_TAGS = 30;
const fieldClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100";

export default function SettingsPanel({
  readOnly,
  designers,
  designerId,
  onDesigner,
  tags,
  tagInput,
  onTagInput,
  onAddTag,
  onRemoveTag,
  backgroundColor,
  onBackground,
  createdAt,
  onReset,
}: Props) {
  const { t, i18n } = useTranslation();

  const commitTag = () => {
    const v = tagInput.trim().replace(/,+$/, "").trim();
    if (!v || tags.length >= MAX_TAGS) return;
    if (!tags.some((x) => x.toLowerCase() === v.toLowerCase())) onAddTag(v);
    onTagInput("");
  };

  const onTagKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commitTag();
    } else if (e.key === "Backspace" && !tagInput && tags.length) {
      onRemoveTag(tags.length - 1);
    }
  };

  const date = createdAt
    ? new Date(createdAt).toLocaleDateString(i18n.language?.startsWith("ar") ? "ar" : "en", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <div className="space-y-5 rounded-2xl border border-gray-200 bg-white p-4 text-gray-900 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100">
      <h2 className="text-sm font-bold uppercase tracking-wide opacity-70">{t("editor.settings")}</h2>

      <div className="space-y-1.5">
        <label htmlFor="designer-select" className="text-sm font-medium">
          {t("admin.designer")}
        </label>
        <select
          id="designer-select"
          value={designerId}
          disabled={readOnly}
          onChange={(e) => onDesigner(e.target.value)}
          className={fieldClass}
        >
          <option value="">{t("admin.selectDesigner")}</option>
          {designers.map((d) => (
            <option key={d._id} value={d._id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="tag-input" className="text-sm font-medium">
          {t("admin.tags")}
        </label>
        {tags.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {tags.map((tag, i) => (
              <li
                key={tag}
                className="flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-200"
              >
                {tag}
                {!readOnly && (
                  <button
                    type="button"
                    aria-label={t("admin.deleteTag", { tag })}
                    onClick={() => onRemoveTag(i)}
                    className="rounded-full p-0.5 hover:bg-black/10"
                  >
                    <X size={12} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
        {!readOnly && (
          <input
            id="tag-input"
            type="text"
            value={tagInput}
            maxLength={50}
            disabled={tags.length >= MAX_TAGS}
            placeholder={t("admin.addTagPlaceholder")}
            onChange={(e) => onTagInput(e.target.value)}
            onKeyDown={onTagKey}
            onBlur={commitTag}
            className={fieldClass}
          />
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="bg-color" className="text-sm font-medium">
          {t("admin.changeBgColor")}
        </label>
        <div className="flex items-center gap-2">
          <input
            id="bg-color"
            type="color"
            value={/^#[0-9a-f]{6}$/i.test(backgroundColor) ? backgroundColor : "#f9fafb"}
            disabled={readOnly}
            onChange={(e) => onBackground(e.target.value)}
            className="h-10 w-14 cursor-pointer rounded-lg border border-gray-300 bg-transparent p-1 dark:border-gray-700"
          />
          <code dir="ltr" className="text-xs opacity-70">
            {backgroundColor}
          </code>
        </div>
      </div>

      {date && (
        <p className="flex items-center gap-2 text-xs opacity-70">
          <Calendar size={14} />
          {t("admin.creationDate")} {date}
        </p>
      )}

      {!readOnly && onReset && (
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-2 text-sm text-red-600 hover:underline dark:text-red-400"
        >
          <RotateCcw size={14} />
          {t("admin.reset")}
        </button>
      )}
    </div>
  );
}
