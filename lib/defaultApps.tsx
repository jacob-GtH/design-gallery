import {
  FiHome,
  FiTerminal,
  FiChrome,
  FiFolder,
  FiFileText,
  FiActivity,
  FiSettings,
  FiGrid,
  FiMail,
} from "react-icons/fi";
import { FaFirefoxBrowser } from "react-icons/fa";
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
    name: "الرئيسية",
    icon: <FiHome size={24} />,
    color: "#3B82F6",
    action: () => (window.location.href = "/"),
  },
  // {
  //   name: 'Terminal',
  //   icon: <FiTerminal size={24} />,
  //   color: '#10B981',
  // },
  // {
  //   name: 'Chrome',
  //   icon: <FiChrome size={24} />,
  //   color: '#F59E0B',
  // },
  // {
  //   name: 'الملفات',
  //   icon: <FiFolder size={24} />,
  //   color: '#8B5CF6',
  // },
  {
    name: "النصوص",
    icon: <FiFileText size={24} />,
    color: "#06B6D4",
  },
  // {
  //   name: 'Firefox',
  //   icon: <FaFirefoxBrowser size={24} />,
  //   color: '#FF7F00',
  // },
  // {
  //   name: 'المراقب',
  //   icon: <FiActivity size={24} />,
  //   color: '#EF4444',
  // },
  {
    name: "الإعدادات",
    icon: <FiSettings size={24} />,
    color: "#6B7280",
  },
  {
    name: "الشبكة",
    icon: <FiGrid size={24} />,
    color: "#EC4899",
  },
  {
    name: "البريد",
    icon: <FiMail size={24} />,
    color: "#F97316",
    badge: 3,
  },
];
