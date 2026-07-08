import React from "react";

const MediaPlaceholder: React.FC = () => {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-800">
      <div className="animate-pulse">
        <div className="w-12 h-12 bg-gray-600 rounded-full"></div>
      </div>
    </div>
  );
};

export default MediaPlaceholder;
