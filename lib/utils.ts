import { twMerge } from "tailwind-merge"
import { clsx, type ClassValue } from "clsx"
/**
 * @description: 合并类名
 * @param {array} inputs
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
  }
  