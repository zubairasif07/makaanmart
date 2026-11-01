import { APP_CONFIG, AREA_UNITS } from '@/config';

/**
 * Format a price in PKR into a human-readable short form.
 * e.g. 32500000 → "PKR 3.25 Cr" or "PKR 85 Lakh"
 */
export function formatPrice(amount: number, short = true): string {
  const { crore, lakh } = APP_CONFIG.currency.shortScale;
  if (!short) {
    return `PKR ${amount.toLocaleString('en-PK')}`;
  }
  if (amount >= crore) {
    const val = (amount / crore).toFixed(amount % crore === 0 ? 0 : 2);
    return `PKR ${val} Cr`;
  }
  if (amount >= lakh) {
    const val = (amount / lakh).toFixed(amount % lakh === 0 ? 0 : 1);
    return `PKR ${val} Lakh`;
  }
  return `PKR ${amount.toLocaleString('en-PK')}`;
}

/**
 * Format area with the given unit.
 */
export function formatArea(area: number, unit: string): string {
  const u = AREA_UNITS[unit as keyof typeof AREA_UNITS];
  if (!u) return `${area} ${unit}`;
  return `${area} ${u.label}`;
}

/**
 * Relative time string (e.g. "3 days ago").
 */
export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${diffDays >= 14 ? 's' : ''} ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${diffDays >= 60 ? 's' : ''} ago`;
  return `${Math.floor(diffDays / 365)} year${diffDays >= 730 ? 's' : ''} ago`;
}

/**
 * Format a date as a readable string.
 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-PK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Generate WhatsApp chat URL.
 */
export function whatsappUrl(phone: string, message = ''): string {
  const cleaned = phone.replace(/\D/g, '');
  const encoded = encodeURIComponent(message);
  return `${APP_CONFIG.whatsappBase}${cleaned}?text=${encoded}`;
}

/**
 * Clamp a number within [min, max].
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Generate slugs from titles.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Get initials from a name (for avatar fallback).
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

/**
 * cn — merge Tailwind classes intelligently.
 */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Mortgage / EMI calculator.
 * @param principal Loan amount in PKR
 * @param annualRate Annual interest rate %
 * @param tenureMonths Loan tenure in months
 * @returns monthly EMI
 */
export function calculateEMI(principal: number, annualRate: number, tenureMonths: number): number {
  if (annualRate === 0) return principal / tenureMonths;
  const r = annualRate / 100 / 12;
  const n = tenureMonths;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

/**
 * Truncate text to maxLength with ellipsis.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '…';
}
