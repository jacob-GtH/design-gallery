// components/editor/RichText.tsx
"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { editorExtensions } from "./extensions";
import { useActiveEditor } from "./EditorContext";

type Props = {
  value: string;
  onChange?: (html: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
  minHeightClass?: string;
};

/**
 * محرر TipTap واحد (نص أو وصف صورة). القيمة ابتدائية فقط (غير مضبوطة من الخارج)؛
 * لإعادة التحميل غيّر الـ key من المكوّن الأب.
 */
export default function RichText({
  value,
  onChange,
  readOnly = false,
  placeholder,
  autoFocus = false,
  className = "",
  minHeightClass = "min-h-[3rem]",
}: Props) {
  const { setActiveEditor } = useActiveEditor();

  const editor = useEditor({
    extensions: editorExtensions,
    content: value || "",
    editable: !readOnly,
    immediatelyRender: false,
    autofocus: autoFocus ? "end" : false,
    editorProps: {
      attributes: { class: `rich-content outline-none ${minHeightClass}` },
    },
    onUpdate: ({ editor: ed }) => onChange?.(ed.isEmpty ? "" : ed.getHTML()),
    onFocus: ({ editor: ed }) => setActiveEditor(ed),
  });

  // عند إزالة الكتلة: لا يبقى محرر ميت كمحرر نشط
  useEffect(() => {
    if (!editor) return;
    return () => {
      setActiveEditor((prev) => (prev === editor ? null : prev));
    };
  }, [editor, setActiveEditor]);

  if (!editor) return null;

  return (
    <div className={`relative ${className}`}>
      {!readOnly && placeholder && editor.isEmpty && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 opacity-50"
          aria-hidden="true"
        >
          {placeholder}
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  );
}
