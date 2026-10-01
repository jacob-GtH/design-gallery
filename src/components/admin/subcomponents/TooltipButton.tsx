import React from "react";
import { useTranslation } from "react-i18next";

interface TooltipButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  tooltip: string;
  color: "blue" | "purple" | "gray" | "green" | "red";
  disabled?: boolean;
}

const TooltipButton: React.FC<TooltipButtonProps> = ({
  icon,
  onClick,
  tooltip,
  color,
  disabled = false,
}) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language?.startsWith("ar");
  const tooltipClass = isRTL
    ? "absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
    : "absolute right-full mr-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity";

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
      <span className={tooltipClass}>
        {tooltip}
      </span>
    </div>
  );
};

export default TooltipButton;
