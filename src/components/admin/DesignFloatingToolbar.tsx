"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { motion } from "framer-motion";
import { FiUpload, FiLoader, FiFileText, FiRepeat, FiImage, FiTag } from "react-icons/fi";
import { FileTextIcon } from "lucide-react";
import { Button } from "../ui/Button";
import Alert from "../ui/Alert";
import { FormState } from "./Types";
import TooltipButton from "./subcomponents/TooltipButton";
import ColorPicker from "./subcomponents/ColorPicker";

type Props = {
  formData: FormState;
  dispatch: React.Dispatch<any>;
  bgColor: string;
  setBgColor: (color: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  loading: boolean;
  error: string;
  success: boolean;
  initialData?: any;
  resetForm: () => void;
  mode?: "create" | "edit" | "view";
};

export default function DesignFloatingToolbar({
  formData,
  dispatch,
  bgColor,
  setBgColor,
  handleSubmit,
  loading,
  error,
  success,
  initialData,
  mode,
  resetForm,
}: Props) {
  if (mode === "view") return null;

  return (
    <motion.form
      onSubmit={(e) => e.preventDefault()}
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="fixed z-[100] right-2 top-1 mt-20 sm:right-4 transform -translate-y-1/2 space-y-4"
    >
      {error && <Alert type="error" message={error} autoDismiss={false} />}
      {success && <Alert type="success" message="تم رفع التصميم بنجاح" autoDismiss duration={6000} />}

      <div className="flex flex-col items-center space-y-2 sm:p-4 bg-white p-1 border border-gray-100 shadow-lg rounded-xl">
        <TooltipButton
          icon={<FiFileText size={20} />}
          onClick={() => document.getElementById("title-input")?.focus()}
          tooltip="إضافة عنوان"
          color="blue"
        />

        <TooltipButton
          icon={<FileTextIcon size={20} />}
          onClick={() => document.getElementById("description-input")?.focus()}
          tooltip="إضافة وصف"
          color="purple"
        />

        <TooltipButton
          icon={<FiImage size={20} />}
          onClick={() => document.getElementById("file-upload")?.click()}
          tooltip="رفع وسائط"
          color="gray"
        />

        <TooltipButton
          icon={<FiTag size={20} />}
          onClick={() => document.getElementById("tag-input")?.focus()}
          tooltip="إضافة علامة (قيد التطوير)"
          color="green"
        />

        <ColorPicker
          color={formData.backgroundColor}
          onChange={(color) => {
            setBgColor(color);
            dispatch({ type: "UPDATE_FIELD", field: "backgroundColor", value: color });
          }}
          tooltip="تغيير لون الخلفية"
        />

        <TooltipButton
          icon={<FiRepeat size={20} />}
          onClick={resetForm}
          tooltip="إعادة تعيين"
          color="gray"
        />
      </div>

      <Button
        type="submit"
        onClick={handleSubmit}
        variant="primary"
        className="flex items-center justify-center m-auto"
      >
        {loading ? <FiLoader className="animate-spin" size={20} /> : <FiUpload size={20} />}
        <span className="sr-only">
          {loading ? "جاري الرفع..." : initialData ? "حفظ التعديلات" : "نشر التصميم"}
        </span>
      </Button>
    </motion.form>
  );
}
