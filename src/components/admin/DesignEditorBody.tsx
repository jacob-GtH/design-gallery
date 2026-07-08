/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import MediaItemPreview from "@/components/admin/subcomponents/MediaItemPreview";
import EmptyDropZone from "@/components/admin/subcomponents/EmptyDropZone";
import DesignerSelect from "@/components/admin/subcomponents/DesignerSelect";
import CreationDateInfo from "@/components/admin/subcomponents/CreationDateInfo";
import { Designer, FormState, MediaItem } from "@/components/admin/Types";
import { useQuillModules } from "@/hooks/useQuillModules";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

type Mode = "create" | "edit" | "view";

interface DesignEditorBodyProps {
  mode: Mode;
  bgColor?: string;
  formData: FormState;
  editorRef?: React.RefObject<any>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  mediaItems: MediaItem[];
  handleCaptionChange: (index: number, value: string) => void;
  dispatch: React.Dispatch<any>;
  formDispatch: React.Dispatch<any>;
  toolbarFocused: boolean;
  designers: Designer[];
  handleRemoveTag?: (i: number) => void;
  handleAddTag?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const DesignEditorBody: React.FC<DesignEditorBodyProps> = ({
  mode,
  formData,
  handleInputChange,
  handleFileChange,
  mediaItems,
  handleCaptionChange,
  dispatch,
  formDispatch,
  toolbarFocused,
  designers,
}) => {
  const isReadOnly = mode === "view";
  const [isDragging, setIsDragging] = React.useState(false);
  const modules = useQuillModules();

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
    if (!isReadOnly && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const event = {
        target: { files: e.dataTransfer.files },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileChange(event);
    }
  };

  return (
    <div className="w-full md:w-full py-6 overflow-y-auto ">
      <div className="max-w-7xl mx-auto">
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

        <div className="space-y-0 ">
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
                      }, 5000)
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
                    className="no-border-quill"
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        <div className="mt-1 m-20 p-4 border-gray-200">
          <DesignerSelect
            designerId={typeof formData.designerId === "string" ? formData.designerId : formData.designerId?._id || ""}
            designers={designers}
            isReadOnly={isReadOnly}
            onDesignerChange={(value) =>
              formDispatch({ type: "SET_FIELD", field: "designerId", value })
            }
          />
          <CreationDateInfo />
        </div>
      </div>
    </div>
  );
};

export default DesignEditorBody;
