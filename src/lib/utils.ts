// Utility to extract a name from an email address (before @), remove special chars, and format as 'Firstname Lastname'.
export function extractNameFromEmail(email: string): string {
  if (!email) return '';
  const beforeAt = email.split('@')[0];
  // Replace underscores, dots, hyphens with space, then remove any other non-alphanumeric except space
  let cleaned = beforeAt.replace(/[._-]+/g, ' ');
  cleaned = cleaned.replace(/[^a-zA-Z0-9 ]/g, '');
  // Capitalize each word
  return cleaned
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
