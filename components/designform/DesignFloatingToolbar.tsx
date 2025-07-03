"use client";

import { motion } from "framer-motion";
import {
  FiUpload,
  FiLoader,
  FiFileText,
  FiRepeat,
  FiImage,
  FiTag,
} from "react-icons/fi";
import { FileTextIcon } from "lucide-react";
import { Button } from "../ui/Button";

type Props = {
  formData: any;
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

const Alert = ({
  type,
  message,
}: {
  type: "error" | "success";
  message: string;
}) => (
  <div
    className={`p-3 rounded-md ${
      type === "error"
        ? "bg-red-50 text-red-700 border-l-4 border-red-500"
        : "bg-green-50 text-green-700 border-l-4 border-green-500"
    }`}
  >
    {message}
  </div>
);

function TooltipButton({
  icon,
  onClick,
  tooltip,
  color,
  disabled = false,
}: { 
  icon: React.ReactNode;
  onClick: () => void;
  tooltip: string;
  color: "blue" | "purple" | "gray" | "green" | "red";
  disabled?: boolean;
}) { 
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 hover:bg-blue-100",
    purple: "bg-purple-50 text-purple-600 hover:bg-purple-100",
    gray: "bg-gray-50 text-gray-600 hover:bg-gray-100",
    green: "bg-green-50 text-green-600 hover:bg-green-100",
    red: "bg-red-300 text-red-600 hover:bg-red-400",
  };

  return (
    <div className="relative group">
      <button
        onClick={onClick}
        disabled={disabled}
        className={`p-3 rounded-full transition-colors ${colorClasses[color]} ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {icon}
      </button>
      <span className="absolute right-full mr-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
        {tooltip}
      </span>
    </div>
  );
}

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
      onSubmit={(e) => {
        e.preventDefault();
      }}
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="fixed z-[100] right-2 top-1 mt-20 sm:right-4 transform -translate-y-1/2 space-y-4"
    >
      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message="تم رفع التصميم بنجاح" />}

      <div className="flex flex-col items-center space-y-2 sm:p-4 bg-white p-1 border border-gray-100 shadow-lg rounded-xl sm:space-y-2">
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
          tooltip="إضافة علامة"
          color="green"
        />

        {/* اختيار اللون */}
        <div className="relative group">
          <label
            htmlFor="bg-color-picker"
            className="p-3 rounded-full bg-gradient-to-br from-purple-500 to-red-500 hover:bg-red-100 cursor-pointer flex items-center justify-center"
          >
            <div
              className="w-5 h-5 rounded-full border"
              style={{ backgroundColor: bgColor }}
            ></div>
          </label>
          <input
            id="bg-color-picker"
            type="color"
            value={formData.backgroundColor}
            onChange={(e) => {
              setBgColor(e.target.value);
              dispatch({
                type: "UPDATE_FIELD",
                field: "backgroundColor",
                value: e.target.value,
              });
            }}
            className="absolute opacity-0 w-0 h-0"
          />
          <span className="absolute right-full mr-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            تغيير لون الخلفية
          </span>
        </div>

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
        {loading ? (
          <FiLoader className="animate-spin" size={20} />
        ) : (
          <FiUpload size={20} />
        )}
        <span className="sr-only">
          {loading
            ? "جاري الرفع..."
            : initialData
            ? "حفظ التعديلات"
            : "نشر التصميم"}
        </span>
      </Button>
    </motion.form>
  );
}
