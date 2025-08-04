// components/ui/Alert.tsx
import { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";

type AlertProps = {
  type?: "error" | "success" | "info" | "warning";
  message: string;
  autoDismiss?: boolean;
  duration?: number; // in ms
};

const colorMap = {
  error: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-500",
  },
  success: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-500",
  },
  info: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-500",
  },
  warning: {
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    border: "border-yellow-500",
  },
};

export default function Alert({
  type = "info",
  message,
  autoDismiss = false,
  duration = 4000,
}: AlertProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoDismiss) {
      const timer = setTimeout(() => setVisible(false), duration);
      return () => clearTimeout(timer);
    }
  }, [autoDismiss, duration]);

  if (!visible) return null;

  return (
    <div
      className={`relative p-3 pr-8 rounded-md border-l-4 ${
        colorMap[type].bg
      } ${colorMap[type].text} ${colorMap[type].border}`}
    >
      <button
        onClick={() => setVisible(false)}
        className="absolute right-2 top-2 text-sm opacity-60 hover:opacity-100"
        aria-label="إغلاق التنبيه"
      >
        <FiX />
      </button>
      {message}
    </div>
  );
}
