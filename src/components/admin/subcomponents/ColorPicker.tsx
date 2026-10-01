import React from "react";
import { useTranslation } from "react-i18next";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  tooltip: string;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  color,
  onChange,
  tooltip,
}) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language?.startsWith("ar");
  const tooltipClass = isRTL
    ? "absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
    : "absolute right-full mr-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity";

  return (
    <div className="relative group">
      <label
        htmlFor="bg-color-picker"
        className="p-3 rounded-full bg-gradient-to-br from-purple-500 to-red-500 hover:bg-red-100 cursor-pointer flex items-center justify-center"
      >
        <div
          className="w-5 h-5 rounded-full border"
          style={{ backgroundColor: color }}
        ></div>
      </label>
      <input
        id="bg-color-picker"
        type="color"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        className="absolute opacity-0 w-0 h-0"
      />
      <span className={tooltipClass}>
        {tooltip}
      </span>
    </div>
  );
};

export default ColorPicker;
