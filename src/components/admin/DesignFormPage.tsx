// components/admin/DesignFormPage.tsx

import React from "react";
import { useTranslation } from "react-i18next";
import { IDesign } from "@/interfaces/Design";
import { DesignFormViewMode } from "./Types";
import DesignFormCore from "./DesignFormCore";

export default function DesignFormPage({
  mode,
  initialData,
  onSuccess,
  onClose, // 👈 إضافة prop جديدة لإغلاق النموذج
}: {
  mode: DesignFormViewMode;
  initialData?: IDesign;
  onSuccess?: () => void;
  onClose?: () => void; // 👈 استدعاء عند الضغط على ×
}) {
  const { t } = useTranslation();

  const modeTitle =
    mode === "create"
      ? t("admin.createMode")
      : mode === "edit"
      ? t("admin.editMode")
      : t("admin.viewMode");

  return (
    <div className="fixed inset-0 z-[100] h-full overflow-y-auto bg-white dark:bg-black">
      <div className="relative h-full w-full overflow-auto">
        <DesignFormCore
          mode={mode}
          initialData={initialData}
          modeTitle={modeTitle}
          onSuccess={onSuccess}
          onClose={onClose}
        />
      </div>
    </div>
  );
}
