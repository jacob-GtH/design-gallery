// services/designerService.ts

import { Designer } from "@/components/admin/Types";

export async function fetchDesigners(): Promise<Designer[]> {
  const res = await fetch("/api/designers");

  if (!res.ok) {
    throw new Error("فشل في جلب المصممين");
  }

  return res.json();
}
