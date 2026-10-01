import React from "react";
import { useTranslation } from "react-i18next";

interface CreationDateInfoProps {
  date?: string;
}

const CreationDateInfo: React.FC<CreationDateInfoProps> = ({ date }) => {
  const { t } = useTranslation();
  const displayDate = date ? new Date(date) : null;

  return (
    <p className="text-sm text-gray-500">
      {t("admin.creationDate")}{" "}
      {displayDate
        ? displayDate.toLocaleDateString("ar-EG", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : t("admin.notPublishedYet")}
    </p>
  );
};

export default CreationDateInfo;
