import React from "react";
import { useTranslation } from "react-i18next";
import { User } from "lucide-react";

interface DesignerSelectProps {
  designerId: string;
  designers: Array<{ _id: string; name: string }>;
  isReadOnly: boolean;
  onDesignerChange: (value: string) => void;
}

const DesignerSelect: React.FC<DesignerSelectProps> = ({
  designerId,
  designers,
  isReadOnly,
  onDesignerChange,
}) => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl border border-gray-200/80 dark:border-white/10 shadow-sm transition-all mb-4">
      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 shrink-0">
        <User className="w-5 h-5" />
      </div>
      <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
          {t("admin.designer")}
        </span>
        <select
          name="designerId"
          value={designerId}
          onChange={(e) => onDesignerChange(e.target.value)}
          className="bg-white/80 dark:bg-black/60 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all shadow-inner min-w-[200px]"
          disabled={isReadOnly}
        >
          <option value="" className="bg-white dark:bg-gray-900">
            {t("admin.selectDesigner")}
          </option>
          {designers.map((d) => (
            <option key={d._id} value={d._id} className="bg-white dark:bg-gray-900">
              {d.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default DesignerSelect;
