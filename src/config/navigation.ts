import { 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  LineChart, 
  Bell, 
  Settings 
} from "lucide-react";

export interface NavItem {
  title: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  testId: string;
}

export const primaryNavItems: NavItem[] = [
  {
    title: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
    testId: "nav-dashboard",
  },
  {
    title: "Journal",
    path: "/journal",
    icon: BookOpen,
    testId: "nav-journal",
  },
  {
    title: "Learn",
    path: "/learn",
    icon: GraduationCap,
    testId: "nav-learn",
  },
  {
    title: "Chart",
    path: "/chart",
    icon: LineChart,
    testId: "nav-chart",
  },
  {
    title: "Alerts",
    path: "/alerts",
    icon: Bell,
    testId: "nav-alerts",
  },
  {
    title: "Settings",
    path: "/settings",
    icon: Settings,
    testId: "nav-settings",
  },
];
