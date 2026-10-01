import {
  FiHome,
  FiFileText,
  FiSettings,
  FiGrid,
  FiMail,
} from "react-icons/fi";
import { ReactNode } from "react";

export interface App {
  name: string;
  icon: ReactNode;
  color?: string;
  action?: () => void;
  badge?: number;
  isActive?: boolean;
}

export const defaultApps: App[] = [
  {
    name: "dock.home",
    icon: <FiHome size={24} />,
    color: "#3B82F6",
    action: () => (window.location.href = "/"),
  },
  {
    name: "dock.texts",
    icon: <FiFileText size={24} />,
    color: "#06B6D4",
  },
  {
    name: "dock.settings",
    icon: <FiSettings size={24} />,
    color: "#8B7280",
  },
  {
    name: "dock.grid",
    icon: <FiGrid size={24} />,
    color: "#EC4899",
    action: () => (window.location.href = "/designs"),
  },
  {
    name: "dock.mail",
    icon: <FiMail size={24} />,
    color: "#F97316",
    badge: 3,
    isActive: false,
    action: () => (window.location.href = "/contact"),
  },
];
