import React, { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import MediaItemPreview from "./subcomponents/MediaItemPreview";
import EmptyDropZone from "./subcomponents/EmptyDropZone";
// import { isDarkColor } from "@/lib/utils";
import { Designer } from "./Types";
import { useMemo } from "react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import { FloatingToolbar } from "../editor/FloatingToolbar";
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

type Mode = "create" | "edit" | "view";

interface DesignEditorBodyProps {
  mode: Mode;
  bgColor: string;
  formData: any;
  editorRef: any;
  handleInputChange: (e: React.ChangeEvent<any>) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  mediaItems: any[];
  handleCaptionChange: (index: number, value: string) => void;
  dispatch: any;
  toolbarFocused: boolean;
  designers: Designer[];
  handleRemoveTag: (i: number) => void;
  handleAddTag: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const DesignEditorBody: React.FC<DesignEditorBodyProps> = ({
  mode,
  formData,
  editorRef,
  handleInputChange,
  handleFileChange,
  mediaItems,
  handleCaptionChange,
  dispatch,
  bgColor,
  toolbarFocused,
  designers,
  handleRemoveTag,
  handleAddTag,
}) => {
  const isReadOnly = mode === "view";

  // Drag and drop state and handlers
  const [isDragging, setIsDragging] = React.useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (
      !isReadOnly &&
      e.dataTransfer.files &&
      e.dataTransfer.files.length > 0
    ) {
      const event = {
        target: {
          files: e.dataTransfer.files,
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileChange(event);
    }
  };

  function isDarkColor(hex: string) {
    const r = parseInt(hex.substr(1, 2), 16);
    const g = parseInt(hex.substr(3, 2), 16);
    const b = parseInt(hex.substr(5, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 128; // أقل من 128 تعتبر داكنة
  }

  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2] }],
        [{ header: false }],
        ["bold", "italic", "underline", "strike", "blockquote"],
        [
          { list: "ordered" },
          { list: "bullet" },
          { indent: "-1" },
          { indent: "+1" },
        ],
        [{ link: [] }],
        [{ color: [] }],
        ["clean"],
      ],
      clipboard: {
        matchVisual: false,
      },
    }),
    []
  );

  return (
    <div className="w-full md:w-3/4 p-6 overflow-y-auto mb-4 mt-4">
      <div></div>
      <div className="max-w-4xl mx-auto">
        <input
          id="title-input"
          type="text"
          name="title"
          placeholder="اسم المشروع..."
          value={formData.title}
          onChange={handleInputChange}
          className="w-full text-3xl font-bold p-2 mb-4 text-center border-none focus:outline-none bg-transparent"
          required
          readOnly={isReadOnly}
        />

        <textarea
          id="description-input"
          name="description"
          placeholder="وصف المشروع..."
          value={formData.description}
          onChange={handleInputChange}
          className="w-full p-2 mb-2 border-none text-center focus:outline-none bg-transparent min-h-[60px]"
          readOnly={isReadOnly}
        />

        <div className="space-y-0">
          <input
            id="file-upload"
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
            disabled={isReadOnly}
          />
          {mediaItems.length === 0 ? (
            <EmptyDropZone
              isDragging={isDragging}
              handleDragOver={handleDragOver}
              handleDragLeave={handleDragLeave}
              handleDrop={handleDrop}
              disabled={isReadOnly}
            />
          ) : (
            <AnimatePresence>
              {mediaItems.map((item, index) => (
                <motion.div
                  key={item.previewUrl}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.3 }}
                >
                  <MediaItemPreview
                    item={item}
                    index={index}
                    readonly={isReadOnly}
                    dispatch={dispatch}
                    removeMediaItem={(idx: number) => {
                      dispatch({ type: "REMOVE_MEDIA", index: idx });
                    }}
                  />
                  <ReactQuill
                    value={item.caption}
                    onChange={(value) => handleCaptionChange(index, value)}
                    readOnly={isReadOnly}
                    onFocus={() => dispatch({ type: "SHOW_TOOLBAR", index })}
                    onBlur={() =>
                      setTimeout(() => {
                        if (!toolbarFocused) {
                          dispatch({ type: "HIDE_TOOLBAR", index });
                        }
                      }, 9000)
                    }
                    onChangeSelection={(range) => {
                      if (range && range.length > 0) {
                        dispatch({ type: "SHOW_TOOLBAR", index });
                      }
                    }}
                    modules={{
                      ...modules,
                      toolbar: item.showToolbar ? modules.toolbar : false,
                    }}
                    theme="snow"
                    className="border-none !important"
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.tags.map((tag: string, i: number) => (
              <span
                key={i}
                className="bg-gray-100 px-3 py-1 mt-1 rounded-full text-sm flex items-center"
                style={{
                  color: isDarkColor(bgColor) ? "white" : "black",
                }}
              >
                #{typeof tag === "string" ? tag : tag.title}
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(i)}
                    className="ml-1 hover:text-red-500"
                  >
                    &times;
                  </button>
                )}
              </span>
            ))}
          </div>
          {!isReadOnly && (
            <input
              id="tag-input"
              type="text"
              name="currentTagInput"
              placeholder="أضف علامة (اضغط Enter)"
              value={formData.currentTagInput}
              onChange={handleInputChange}
              onKeyDown={handleAddTag}
              className="bg-gray-100 px-3 py-1 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
        </div> */}

        <div className="mt-8 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-4 mb-3">
            <span className="text-gray-500">المصمم:</span>
            <select
              name="designerId"
              value={formData.designerId}
              onChange={(e) =>
                dispatch({
                  type: "UPDATE_FIELD",
                  field: "designerId",
                  value: e.target.value,
                })
              }
              className="bg-gray-100 px-3 py-1 text-gray-500 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isReadOnly}
            >
              <option value="">اختر مصممًا</option>
              {designers.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <p className="text-sm text-gray-500">
            تاريخ الإنشاء:{" "}
            {new Date().toLocaleDateString("ar-EG", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DesignEditorBody;
