import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import MediaItemPreview from "@/components/admin/subcomponents/MediaItemPreview";
import EmptyDropZone from "@/components/admin/subcomponents/EmptyDropZone";
import DesignerSelect from "@/components/admin/subcomponents/DesignerSelect";
import CreationDateInfo from "@/components/admin/subcomponents/CreationDateInfo";
import { Designer, FormState, MediaItem } from "@/components/admin/Types";
import { FormAction } from "@/hooks/formAction";
import { MediaAction } from "@/hooks/mediaAction";
import TipTapEditor from "./TipTapEditor";

type Mode = "create" | "edit" | "view";

interface DesignEditorBodyProps {
  mode: Mode;
  bgColor?: string;
  formData: FormState;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  mediaItems: MediaItem[];
  handleCaptionChange: (index: number, value: string) => void;
  dispatch: React.Dispatch<MediaAction>;
  formDispatch: React.Dispatch<FormAction>;
  toolbarFocused: boolean;
  onToolbarFocusChange: (focused: boolean) => void;
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
  onToolbarFocusChange,
  designers,
  handleRemoveTag,
  handleAddTag,
}) => {
  const { t } = useTranslation();
  const isReadOnly = mode === "view";
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
          placeholder={t("admin.projectTitle")}
          value={formData.title}
          onChange={handleInputChange}
          className="w-full text-3xl font-bold p-2 mb-4 text-center border-none focus:outline-none bg-transparent"
          required
          readOnly={isReadOnly}
        />

        <textarea
          id="description-input"
          name="description"
          placeholder={t("admin.projectDescription")}
          value={formData.description}
          onChange={handleInputChange}
          className="w-full p-2 mb-2 border-none text-center focus:outline-none bg-transparent min-h-[60px]"
          readOnly={isReadOnly}
        />

        <div className="space-y-0 ">
          <input
            id="file-upload"
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp,image/avif,video/mp4,video/webm,video/quicktime"
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
                    moveUp={(idx: number) => {
                      dispatch({ type: "MOVE_MEDIA", fromIndex: idx, toIndex: idx - 1 });
                    }}
                    moveDown={(idx: number) => {
                      dispatch({ type: "MOVE_MEDIA", fromIndex: idx, toIndex: idx + 1 });
                    }}
                  />
                  <TipTapEditor
                    key={`tip-${index}-${item._key}`}
                    value={item.caption}
                    onChange={handleCaptionChange.bind(null, index)}
                    readOnly={isReadOnly}
                    onFocus={() => onToolbarFocusChange(true)}
                    onBlur={() => onToolbarFocusChange(false)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        <div className="mt-1 p-4 border-gray-200">
          <DesignerSelect
            designerId={formData.designerId}
            designers={designers}
            isReadOnly={isReadOnly}
            onDesignerChange={(value) =>
              formDispatch({ type: "SET_FIELD", field: "designerId", value })
            }
          />

          {/* حقل الوسوم */}
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-gray-500">{t("admin.tags")}</span>
              {!isReadOnly && (
                <input
                  id="tag-input"
                  type="text"
                  value={formData.currentTagInput}
                  onChange={(e) =>
                    formDispatch({
                      type: "SET_FIELD",
                      field: "currentTagInput",
                      value: e.target.value,
                    })
                  }
                  onKeyDown={handleAddTag}
                  placeholder={t("admin.addTagPlaceholder")}
                  className="bg-gray-100 px-3 py-1 text-gray-500 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
                />
              )}
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full text-sm border border-indigo-200 dark:border-indigo-900/50"
                  >
                    {tag}
                    {!isReadOnly && (
                      <button
                        onClick={() => handleRemoveTag?.(idx)}
                        type="button"
                        className="hover:text-red-500 transition-colors"
                        aria-label={t("admin.deleteTag", { tag })}
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
              </div>
            )}
          </div>

          <CreationDateInfo />
        </div>
      </div>
    </div>
  );
};

export default DesignEditorBody;
