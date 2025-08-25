import { Badge } from "@/components/ui/badge";
import type { $Enums, StudentBorrow } from "@prisma/client";
import { clsx, type ClassValue } from "clsx";
import { parseISO } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function isDateBAfterDateA(
  dateA: string | Date,
  dateB: string | Date,
): boolean {
  const dA = typeof dateA === "string" ? parseISO(dateA) : dateA;
  const dB = typeof dateB === "string" ? parseISO(dateB) : dateB;

  return dB.getTime() > dA.getTime();
}

export const formatName = (data: {
  firstName: string;
  middleName?: string | null;
  lastName: string;
}) => {
  return `${data.firstName}${data.middleName ? ` ${data.middleName}` : " "} ${data.lastName}`;
};

export const BorrowStatus = ({
  status,
}: {
  status: $Enums.StudentBorrowStatus;
}) => {
  return (
    <Badge
      variant={"default"}
      className={`${status === "BORROWED" ? "bg-orange-500" : status === "RETURNED" ? "bg-blue-500" : ( status === "CANCELLED" ? "bg-red-500" : "bg-gray-500")}`}
    >
      {status}
    </Badge>
  );
};
