"use client";
import React from "react";
import {
  AlertTriangle,
  Clock,
  DollarSign,
  User,
  BookOpen,
  CheckCircle,
  XCircle,
  LoaderCircle,
} from "lucide-react";
import { api } from "@/trpc/react";
import { formatName } from "@/lib/utils";
import { differenceInCalendarDays } from "date-fns";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { parseAsString, parseAsStringEnum, useQueryState } from "nuqs";
const getOverdueDetail = (
  dueDate: Date | string,
  returnDate: Date | string,
) => {
  const due = new Date(dueDate).getTime();
  const ret = new Date(returnDate).getTime();

  if (ret <= due) return "On time";

  let diff = Math.floor((ret - due) / 1000); // difference in seconds

  const days = Math.floor(diff / (60 * 60 * 24));
  diff %= 60 * 60 * 24;

  const hours = Math.floor(diff / (60 * 60));
  diff %= 60 * 60;

  const minutes = Math.floor(diff / 60);
  const seconds = diff % 60;

  const parts = [];
  if (days) parts.push(`${days} day${days > 1 ? "s" : ""}`);
  if (hours) parts.push(`${hours} hr${hours > 1 ? "s" : ""}`);
  if (minutes) parts.push(`${minutes} min${minutes > 1 ? "s" : ""}`);
  if (seconds) parts.push(`${seconds} sec${seconds > 1 ? "s" : ""}`);

  return parts.join(" ") + " overdue";
};
export default function PenaltiesTable() {
  const getDaysOverdue = (dueDate: Date, returnDate: Date) => {
    // Positive if returnDate is after dueDate
    const daysOverdue = differenceInCalendarDays(returnDate, dueDate);
    return daysOverdue > 0 ? daysOverdue : 0;
  };
  const [status, setStatus] = useQueryState(
    "status",
    parseAsStringEnum(["all", "setteled", "unsetteled"]).withDefault("all"),
  );
  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault(""),
  );

  const getSeverityColor = (daysOverdue: number) => {
    if (daysOverdue >= 7) return "text-red-600 font-semibold";
    if (daysOverdue >= 1) return "text-amber-600 font-medium";
    return "text-gray-600";
  };

  // Combined helper
  const getDueSeverity = (dueDate: Date, returnDate: Date) => {
    const daysOverdue = getDaysOverdue(dueDate, returnDate);
    return {
      daysOverdue,
      severityClass: getSeverityColor(daysOverdue),
    };
  };
  const getPenaltyStatus = (isPenalty: boolean, penaltyIsPaid: boolean) => {
    if (isPenalty && !penaltyIsPaid) {
      return {
        status: "UNSETTELED",
        color: "bg-red-100 text-red-800",
        icon: <XCircle className="h-4 w-4" />,
      };
    } else if (isPenalty && penaltyIsPaid) {
      return {
        status: "SETTELED",
        color: "bg-green-100 text-green-800",
        icon: <CheckCircle className="h-4 w-4" />,
      };
    }
    return {
      status: "NO PENALTY",
      color: "bg-gray-100 text-gray-800",
      icon: <CheckCircle className="h-4 w-4" />,
    };
  };

  const { data, isLoading } = api.report.getStudentWithPenalties.useQuery({
    search: search,
    status: status as any,
  });

  const { data: counts } = api.report.getStudentWithPenaltiesCount.useQuery();

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Student Penalties
          </h3>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <div className="mr-2 h-3 w-3 rounded-full bg-red-500"></div>
              <span className="text-gray-600">
                Unsettled: {counts?.unsetteled || 0}
              </span>
            </div>
            <div className="flex items-center">
              <div className="mr-2 h-3 w-3 rounded-full bg-green-500"></div>
              <span className="text-gray-600">
                Setteled: {counts?.setteled || 0}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-5 flex flex-row justify-between gap-2">
          <div className="flex w-full flex-col gap-2 lg:w-auto lg:flex-row">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full xl:min-w-80"
              placeholder="Search student ID"
            />
            <div className="flex w-full flex-row gap-2">
              <Select
                onValueChange={(e) => setStatus(e as any)}
                value={status as any}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <div>
                      <SelectItem value={"all"}>All Status</SelectItem>
                      <SelectItem value={"setteled"} key={"setteled"}>
                        Setteled
                      </SelectItem>
                      <SelectItem value={"unsetteled"} key={"unsetteled"}>
                        Unsetteled
                      </SelectItem>
                    </div>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                Student
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                Thesis
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                Overdue Info
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {isLoading ? (
              <td colSpan={10}>
                <div className="px-6 py-12 text-center text-slate-500">
                  <LoaderCircle className="mx-auto mb-4 size-8 animate-spin" />
                  <h3 className="mb-2 text-lg font-medium">Loading</h3>
                </div>
              </td>
            ) : data?.length ? (
              data?.map((borrow) => {
                const statusInfo = getPenaltyStatus(
                  borrow.isPenalty,
                  borrow.penaltyIsPaid,
                );
                return (
                  <tr
                    key={borrow.id}
                    className="transition-colors duration-150 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                            <User className="h-5 w-5 text-gray-500" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {formatName({
                              ...borrow.Student,
                            })}
                          </div>
                          <div className="text-sm text-gray-500">
                            {borrow.Student.studentId} •{" "}
                            {borrow.Student.courseCode}
                          </div>
                          {(borrow.Student.contactNo ||
                            borrow.Student.email) && (
                            <div className="text-xs text-gray-400">
                              {borrow.Student.contactNo || borrow.Student.email}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <BookOpen className="mt-0.5 mr-2 h-4 w-4 flex-shrink-0 text-gray-400" />
                        <div>
                          <div className="line-clamp-2 max-w-xs text-sm font-medium text-gray-900">
                            {borrow.Thesis.title}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {borrow.borrowDueAt ? (
                        <div className="text-sm">
                          <div className="text-gray-900">
                            Due:{" "}
                            {new Date(borrow.borrowDueAt).toLocaleDateString()}
                          </div>
                          <div
                            className={`${getDueSeverity(borrow.borrowDueAt, borrow.returnedAt!).severityClass} mt-1 flex text-xs items-center`}
                          >
                            <Clock className="mr-1 h-3 w-3" />
                            {getOverdueDetail(
                              borrow.borrowDueAt,
                              borrow.returnedAt!,
                            )}
                          </div>
                        </div>
                      ) : (
                        <></>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusInfo.color}`}
                      >
                        {statusInfo.icon}
                        <span className="ml-1">{statusInfo.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        {!borrow.penaltyIsPaid ? (
                          <>
                            <button className="border-primary-300 bg-primary-50 text-primary-700 hover:bg-primary-100 focus:ring-primary-500 inline-flex cursor-pointer items-center rounded-md border px-3 py-1 text-xs font-medium transition-colors duration-200 focus:ring-2 focus:outline-none">
                              Mark Setteled
                            </button>
                          </>
                        ) : (
                          <span className="inline-flex items-center rounded-md bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Resolved
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <td colSpan={10}>
                <div className="px-6 py-12 text-center">
                  <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
                  <h3 className="mb-2 text-lg font-medium text-gray-900">
                    No Penalties Found
                  </h3>
                  <p className="text-gray-500">
                    All students are up to date with their borrowing
                    responsibilities.
                  </p>
                </div>
              </td>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
