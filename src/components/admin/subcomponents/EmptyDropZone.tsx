// components/EmptyDropZone.tsx
"use client";

import { FiImage } from "react-icons/fi";
import { useTranslation } from "react-i18next";

interface EmptyDropZoneProps {
  disabled?: boolean;
  isDragging: boolean;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
}

const EmptyDropZone = ({
  isDragging,
  handleDragOver,
  handleDragLeave,
  handleDrop,
}: EmptyDropZoneProps) => {
  const { t } = useTranslation();
  return (
  <div
    className={`flex flex-col p-16 m-20 space-y-2 items-center justify-center h-full border-2 ${
      isDragging
        ? "border-blue-500 bg-blue-50"
        : "border-dashed border-gray-300"
    } rounded-xl bg-gray-100 cursor-pointer transition-colors`}
    onDragOver={handleDragOver}
    onDragLeave={handleDragLeave}
    onDrop={handleDrop}
    onClick={() => document.getElementById("file-upload")?.click()}
  >
    <FiImage className="text-4xl text-gray-400 mb-3" />
    <p className="text-gray-500">{t("admin.dragDrop")}</p>
    <p className="text-sm text-gray-400 mt-2">
      {t("admin.supportedFormats")}
    </p>
  </div>
  );
};

export default EmptyDropZone;
