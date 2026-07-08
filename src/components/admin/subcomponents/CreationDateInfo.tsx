import React from "react";

interface CreationDateInfoProps {
  date?: string;
}

const CreationDateInfo: React.FC<CreationDateInfoProps> = ({ date }) => {
  const displayDate = date ? new Date(date) : new Date();
  return (
    <p className="text-sm text-gray-500">
      تاريخ الإنشاء:{" "}
      {displayDate.toLocaleDateString("ar-EG", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })}
    </p>
  );
};

export default CreationDateInfo;
