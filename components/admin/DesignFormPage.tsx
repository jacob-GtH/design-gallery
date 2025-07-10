// components/admin/DesignFormPage.tsx

import React from "react";
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
  return (
    <div className="fixed inset-0 h-full bg-black bg-opacity-90 overflow-y-auto justify-center lg:px-0 sm:px-0 z-[100]">
      <div className=" h-full w-full relative overflow-auto ">
        {/* ✅ زر الإغلاق */}
        <button
          onClick={onClose}
          className="fixed top-8 right-12 text-white hover:text-red-500 text-2xl font-bold z-[10]"
          title="إغلاق"
          
        >
          ✕
        </button>

        <h1 className="fixed top-7 right-16 me-3 text-2xl font-bold mb-4">
          {mode === "create"
            ? ""
            : mode === "edit"
            ? "edit"
            : "view"}
        </h1>

        <DesignFormCore
          mode={mode}
          initialData={initialData}
          onSuccess={onSuccess}
        />
      </div>
    </div>
  );
}
