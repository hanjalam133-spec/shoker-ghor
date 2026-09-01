import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (amount: number) => {
  return `৳ ${amount.toLocaleString('en-IN')}`;
};

export const getProductSlug = (product: { id: string; title: string }) => {
  if (!product.title) return product.id;
  const cleanTitle = product.title
    .trim()
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\u0980-\u09FF\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  return cleanTitle || product.id;
};
