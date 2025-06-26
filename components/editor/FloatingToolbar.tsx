"use client";

import ReactQuill from "react-quill-new";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import React from "react";

interface FloatingToolbarProps {
  editorRef: React.RefObject<ReactQuill | null>;
  modules: {
    toolbar: Array<
      | string
      | { header?: number[] | boolean; align?: boolean; [key: string]: any }
    >[];
  };
  activeIndex: number | null;
  editorReady: boolean;
}

export const FloatingToolbar = ({
  editorRef,
  modules,
  activeIndex,
  editorReady,
}: FloatingToolbarProps) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);

  // تحسين الأداء باستخدام useMemo لحساب الأدوات
  const toolbarContent = useMemo(() => {
    return modules.toolbar.map((group: any, i: number) => (
      <span key={i} className="ql-formats flex items-center">
        {group.map((item: any, j: number) => {
          if (typeof item === "string") {
            return (
              <button
                key={j}
                className={`ql-${item} p-1 hover:bg-gray-100 rounded`}
                title={item.charAt(0).toUpperCase() + item.slice(1)}
              />
            );
          }
          if (item.header) {
            return (
                <select
                key={j}
                className="ql-header border rounded p-1 text-sm"
                defaultValue=""
                >
                <option value="">Normal</option>
                {(Array.isArray(item.header) ? item.header : []).map(
                  (level: number, k: number) => (
                  <option key={k} value={level}>
                    Heading {level}
                  </option>
                  )
                )}
                </select>
            );
          }
          if (item.align) {
            return (
              <select
                key={j}
                className="ql-align border rounded p-1 text-sm"
                defaultValue=""
              >
                {["", "right", "center", "justify"].map((align, k) => (
                  <option key={k} value={align}>
                    {align || "Default"}
                  </option>
                ))}
              </select>
            );
          }
          return null;
        })}
      </span>
    ));
  }, [modules.toolbar]);

  useEffect(() => {
    if (!editorRef.current || activeIndex === null || !editorReady) {
      setIsVisible(false);
      return;
    }

    const editor = editorRef.current.getEditor();
    let animationFrameId: number;

    const updateToolbarPosition = () => {
      const selection = editor.getSelection();
      if (!selection) {
        setIsVisible(false);
        return;
      }

      // استخدام requestAnimationFrame لتحسين الأداء
      animationFrameId = requestAnimationFrame(() => {
        try {
          const bounds = editor.getBounds(selection.index);
          const containerRect = editor.root.getBoundingClientRect();

            if (!bounds) {
            setIsVisible(false);
            return;
            }
            setPosition({
            top: bounds.top + containerRect.top - 50,
            left: bounds.left + containerRect.left,
            });
          setIsVisible(true);
        } catch (error) {
          console.error("Error updating toolbar position:", error);
          setIsVisible(false);
        }
      });
    };

    // إضافة event listeners مع debouncing
    const debouncedUpdate = debounce(updateToolbarPosition, 100);

    editor.on("selection-change", debouncedUpdate);
    editor.on("text-change", debouncedUpdate);

    // حساب أولي للموضع
    updateToolbarPosition();

    return () => {
      cancelAnimationFrame(animationFrameId);
      editor.off("selection-change", debouncedUpdate);
      editor.off("text-change", debouncedUpdate);
    };
  }, [editorRef, activeIndex, editorReady]);

  // دالة debounce لتحسين الأداء
  function debounce(func: () => void, wait: number) {
    let timeout: NodeJS.Timeout;
    return () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(), wait);
    };
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.15 }}
          className="fixed z-[100] bg-white shadow-lg rounded-lg border border-gray-200 p-2"
          style={{}}
        >
          <div className="ql-toolbar ql-snow flex flex-wrap gap-1">
            {toolbarContent}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
