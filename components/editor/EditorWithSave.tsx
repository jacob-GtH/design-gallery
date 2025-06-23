// مكون محرر نص مستقل قابل لإعادة الاستخدام مع دعم initialValue و onSave

"use client";

import React, { useState, useRef, useMemo, useEffect } from "react";
import ReactQuill from "react-quill-new";
import { FloatingToolbar } from "./FloatingToolbar";
import "react-quill-new/dist/quill.snow.css";

interface EditorWithSaveProps {
  initialValue?: string;
  onSave: (plainText: string, html: string) => void;
}

export const EditorWithSave = ({
  initialValue = "",
  onSave,
}: EditorWithSaveProps) => {
  const [value, setValue] = useState(initialValue);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [editorReady, setEditorReady] = useState(false);
  const editorRef = useRef<ReactQuill>(null);

  const modules = useMemo(
    () => ({
      toolbar: [
        ["bold", "italic", "underline", "strike"],
        [{ header: [1, 2, 3, false] }],
        [{ align: [] }],
        ["clean"],
      ],
    }),
    []
  );

  useEffect(() => {
    if (editorRef.current) setEditorReady(true);
  }, []);

  const handleSave = () => {
    if (editorRef.current) {
      const editor = editorRef.current.getEditor();
      const html = editor.root.innerHTML;
      const plainText = editor.getText();
      onSave(plainText.trim(), html);
    }
  };

  return (
    <div className="relative">
      <FloatingToolbar
        editorRef={editorRef}
        modules={modules}
        activeIndex={activeIndex}
        editorReady={editorReady}
      />

      <ReactQuill
        ref={editorRef}
        theme="snow"
        value={value}
        onChange={(content, delta, source, editor) => {
          setValue(content);
          setActiveIndex(editor.getSelection()?.index || null);
        }}
        modules={modules}
        placeholder="اكتب هنا..."
        className="bg-white rounded-lg border border-gray-200"
      />

      <div className="mt-4 flex justify-end">
        <button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          حفظ النص
        </button>
      </div>
    </div>
  );
};
