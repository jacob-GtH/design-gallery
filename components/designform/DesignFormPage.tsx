// components/admin/DesignFormPage.tsx

import React from "react";
import { IDesign } from "@/interfaces/Design";
import { DesignFormViewMode } from "./Types";
import DesignFormCore from "./DesignFormCore";


export default function DesignFormPage({
  mode,
  initialData,
  onSuccess,
}: {
  mode: DesignFormViewMode;
  initialData?: IDesign;
  onSuccess?: () => void;
}) {
  return (
    <div className="design-form-page">
      <h1 className="text-2xl font-bold mb-4">
        {mode === "create"
          ? "إضافة تصميم جديد"
          : mode === "edit"
          ? "تعديل التصميم"
          : "عرض التصميم"}
      </h1>

      <DesignFormCore mode={mode} initialData={initialData} onSuccess={onSuccess} />
    </div>
  );
}
