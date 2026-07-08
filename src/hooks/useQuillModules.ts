import { useMemo } from "react";

export const useQuillModules = () => {
  return useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, 4] }],
        [{ header: false }],
        ["bold", "italic", "underline", "strike", "blockquote"],
        [
          { list: "ordered" },
          { list: "bullet" },
          { indent: "-1" },
          { indent: "+1" },
        ],
        [{ link: [] }],
        [{ color: [] }],
        ["clean"],
      ],
      clipboard: {
        matchVisual: false,
      },
    }),
    []
  );
};
