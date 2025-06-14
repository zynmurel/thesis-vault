import { IconBooks, IconBookUpload, IconLayoutDashboard, IconReport, IconSettings } from "@tabler/icons-react";

export const menu = [
    {
      title: "Dashboard",
      key : "dashboard",
      url: "/dashboard",
      icon: IconLayoutDashboard,
    },
    {
      title: "Borrows",
      key : "borrows",
      url: "/borrows",
      icon: IconBookUpload,
    },
    {
      title: "Theses",
      key : "theses",
      url: "/theses",
      icon: IconBooks,
    },
    {
      title: "Reports",
      key : "reports",
      url: "/reports",
      icon: IconReport,
    },
    {
      title: "Settings",
      key : "settings",
      url: "/settings",
      icon: IconSettings,
    }
  ]