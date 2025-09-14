"use client";
import React from "react";
import { GraduationCap, BookOpen, Users, TrendingUp } from "lucide-react";
import { api } from "@/trpc/react";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionCards } from "../../dashboard/_components/section-cards";

interface DepartmentData {
  code: string;
  title: string;
  studentCount: number;
  thesesCount: number;
  activeBorrows: number;
  trend: "up" | "down" | "stable";
}

export default function DepartmentStats() {
  const { data } = api.report.getDepartmentReport.useQuery();
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "down":
        return <TrendingUp className="h-4 w-4 rotate-180 text-red-500" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-300" />;
    }
  };
  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-6 py-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <GraduationCap className="h-5 w-5 text-blue-600" />
          Department
        </h3>
      </div>
      <div className="p-6">
        <div className="space-y-6">
          {data ? (
            [data].map((dept) => (
              <div
                key={dept.code}
                className=""
              >
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{dept.code}</h4>
                    <p className="mt-1 text-sm text-gray-600">{dept.title}</p>
                  </div>
                  {getTrendIcon(dept.trend)}
                </div>

                <SectionCards />
              </div>
            ))
          ) : (
            <Skeleton className="h-40 w-full" />
          )}
        </div>
      </div>
    </div>
  );
}
