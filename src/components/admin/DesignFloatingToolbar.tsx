"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { motion } from "framer-motion";
import { FiUpload, FiLoader, FiFileText, FiRepeat, FiImage, FiTag, FiEye } from "react-icons/fi";
import { FileTextIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
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
  initialData?: any;
  resetForm: () => void;
  mode?: "create" | "edit" | "view";
};

export default function DesignFloatingToolbar({
  formData,
  dispatch,
  setBgColor,
  handleSubmit,
  loading,
  error,
  initialData,
  mode,
  resetForm,
}: Props) {
  const { t } = useTranslation();
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

      <div className="flex flex-col items-center space-y-2 sm:p-4 bg-white dark:bg-gray-900 p-1 border border-gray-100 dark:border-gray-800 shadow-lg rounded-xl transition-colors duration-500">
        <TooltipButton
          icon={<FiFileText size={20} />}
          onClick={() => document.getElementById("title-input")?.focus()}
          tooltip={t("admin.addTitle")}
          color="blue"
        />

        <TooltipButton
          icon={<FileTextIcon size={20} />}
          onClick={() => document.getElementById("description-input")?.focus()}
          tooltip={t("admin.addDescription")}
          color="purple"
        />

        <TooltipButton
          icon={<FiImage size={20} />}
          onClick={() => document.getElementById("file-upload")?.click()}
          tooltip={t("admin.uploadMedia")}
          color="gray"
        />

        <TooltipButton
          icon={<FiTag size={20} />}
          onClick={() => document.getElementById("tag-input")?.focus()}
          tooltip={t("admin.addTag")}
          color="green"
        />

        {initialData?.id && (
          <TooltipButton
            icon={<FiEye size={20} />}
            onClick={() => window.open(`/admin/view/${initialData.id}`, "_blank")}
            tooltip={t("admin.preview")}
            color="purple"
          />
        )}

        <ColorPicker
          color={formData.backgroundColor}
          onChange={(color) => {
            setBgColor(color);
            dispatch({ type: "SET_FIELD", field: "backgroundColor", value: color });
          }}
          tooltip={t("admin.changeBgColor")}
        />

        <TooltipButton
          icon={<FiRepeat size={20} />}
          onClick={resetForm}
          tooltip={t("admin.reset")}
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
          {loading ? t("admin.uploading") : initialData ? t("admin.saveChanges") : t("admin.publishDesign")}
        </span>
      </Button>
    </motion.form>
  );
}
