import React from "react";

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
  return (
    <div className="flex items-center space-x-4 mb-3">
      <span className="text-gray-500">المصمم:</span>
      <select
        name="designerId"
        value={designerId}
        onChange={(e) => onDesignerChange(e.target.value)}
        className="bg-gray-100 px-3 py-1 text-gray-500 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={isReadOnly}
      >
        <option value="">اختر مصممًا</option>
        {designers.map((d) => (
          <option key={d._id} value={d._id}>
            {d.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DesignerSelect;
