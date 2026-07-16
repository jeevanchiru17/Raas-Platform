import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind CSS class names safely.
 * Combines clsx (conditional classes) with tailwind-merge (conflict resolution).
 *
 * @example cn('px-4 py-2', isActive && 'bg-blue-500', 'px-6') → 'py-2 bg-blue-500 px-6'
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
