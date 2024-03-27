import { type ClassValue, clsx } from 'clsx'

export function cn(...className: ClassValue[]) {
  return clsx(className)
}
