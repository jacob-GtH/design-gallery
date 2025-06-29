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
    <div className="design-form-page overflow-y-auto">
      <h1 className="text-2xl font-bold mb-4">
        {mode === "create"
          ? ""
          : mode === "edit"
          ? "تعديل التصميم"
          : "عرض التصميم"}
      </h1>

      <DesignFormCore mode={mode} initialData={initialData} onSuccess={onSuccess} />
    </div>
  );
}
