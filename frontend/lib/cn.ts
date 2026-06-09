import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...values: ReadonlyArray<ClassValue>): string {
  return twMerge(clsx(values));
}
