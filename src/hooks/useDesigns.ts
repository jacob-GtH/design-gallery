"use client";

import { useCallback, useEffect, useState } from "react";
import { IDesign } from "@/interfaces/Design";

export function useDesigns() {
  const [designs, setDesigns] = useState<IDesign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDesigns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/designs");
      if (!response.ok) {
        throw new Error("فشل تحميل التصاميم");
      }
      const data: IDesign[] = await response.json();
      setDesigns(data);
    } catch (err: unknown) {
      setError((err as Error).message || "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDesigns();
  }, [fetchDesigns]);

  return { designs, loading, error, retry: fetchDesigns };
}