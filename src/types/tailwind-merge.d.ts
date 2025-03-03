declare module 'tailwind-merge' {
  export function twMerge(...classLists: string[]): string;
  export function twJoin(...classLists: string[]): string;
} 