// components/DesignForm/subcomponents/MediaItem.tsx
import React, { useState } from "react";

export type MediaType = "image" | "video";

export type MediaItem = {
  id: string;
  file?: File;
  previewUrl: string;
  type: MediaType;
  caption: string;
  uploadedUrl?: string;
};

type MediaItemProps = {
  item: MediaItem;
  index: number;
  mode: "create" | "edit" | "view";
  onUpdateCaption: (index: number, caption: string) => void;
  onRemove?: (index: number) => void;
};

export function MediaItemComponent({
  item,
  index,
  mode,
  onUpdateCaption,
  onRemove,
}: MediaItemProps) {
  const [caption, setCaption] = useState(item.caption);

  const handleCaptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCaption(e.target.value);
    onUpdateCaption(index, e.target.value);
  };

  return (
    <div className="media-item">
      {item.type === "image" ? (
        <img src={item.previewUrl} alt={`media-${index}`} width={150} />
      ) : (
        <video src={item.previewUrl} width={150} controls />
      )}

      {mode !== "view" && (
        <>
          <input
            type="text"
            value={caption}
            onChange={handleCaptionChange}
            placeholder="أدخل تعليق الوسائط"
          />
          {onRemove && (
            <button onClick={() => onRemove(index)} type="button">
              حذف
            </button>
          )}
        </>
      )}

      {mode === "view" && <p>{caption}</p>}
    </div>
  );
}
