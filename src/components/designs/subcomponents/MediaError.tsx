import React from "react";
import { FiEye } from "react-icons/fi";

const MediaError: React.FC = () => {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-800">
      <div className="text-center text-gray-400">
        <FiEye size={48} className="mx-auto mb-4 opacity-50" />
        <p>فشل في تحميل الوسائط</p>
      </div>
    </div>
  );
};

export default MediaError;
