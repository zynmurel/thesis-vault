"use client";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/trpc/react";
import {
  AlertTriangle,
  ArrowUpRight,
  BookOpen,
  Clock,
  LoaderCircle,
  Users,
} from "lucide-react";
import ReportCard from "./reports-card";

export function SectionCards() {
  const { data, isLoading } = api.dashboard.getDashboardCounts.useQuery();
  return (
    <div className=" grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <ReportCard
        title="Total Theses"
        value={data?.booksCount ? String(data?.booksCount) : "0"}
        changeType="positive"
        icon={BookOpen}
        iconBgColor="bg-blue-500"
        description="Across CCIS department"
      />
      <ReportCard
        title="Active Students"
        value={data?.studentCount ? String(data.studentCount) : "0"}
        changeType="positive"
        icon={Users}
        iconBgColor="bg-green-500"
        description="Registered students"
      />
      <ReportCard
        title="Active Borrows"
        value={data?.borrowedCount ? String(data?.borrowedCount) : "0"}
        change="-5% from last week"
        changeType="negative"
        icon={Clock}
        iconBgColor="bg-amber-500"
        description="Currently borrowed items"
      />
      <ReportCard
        title="Overdue Items"
        value={data?.overDueCount ? String(data?.overDueCount) : "0"}
        change="3 new today"
        changeType="negative"
        icon={AlertTriangle}
        iconBgColor="bg-red-500"
        description="Requires attention"
      />
    </div>
  );
}
