// components/DesignForm/subcomponents/TagInput.tsx

import React, { useState } from "react";
import { TagInputProps } from "../Types"

export function TagInput({ tags, onAdd, onRemove, disabled }: TagInputProps) {
  const [input, setInput] = useState("");

  const handleAddTag = () => {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onAdd(trimmed);
      setInput("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="tag-input-wrapper">
      {!disabled && (
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="أدخل وسم واضغط Enter"
        />
      )}

      <div className="tag-list">
        {tags.map((tag, idx) => (
          <span key={idx} className="tag">
            {tag}
            {!disabled && (
              <button onClick={() => onRemove(idx)} type="button">
                ×
              </button>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
