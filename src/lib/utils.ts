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
