import { format, formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

export function calculateAge(birthDate: Date): { years: number; months: number } {
  const now = new Date()
  let years  = now.getFullYear() - birthDate.getFullYear()
  let months = now.getMonth()    - birthDate.getMonth()

  if (now.getDate() < birthDate.getDate()) months--
  if (months < 0) { years--; months += 12 }

  return { years, months }
}

export function formatAge(birthDate: Date): string {
  const { years, months } = calculateAge(birthDate)
  if (years === 0) return `${months} ${months === 1 ? "mes" : "meses"}`
  if (months === 0) return `${years} ${years === 1 ? "año" : "años"}`
  return `${years}a ${months}m`
}

export function formatRelativeDate(date: Date): string {
  const diffDays = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return "Hoy"
  if (diffDays === 1) return "Ayer"
  if (diffDays < 7)  return `Hace ${diffDays} días`
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} ${Math.floor(diffDays / 7) === 1 ? "semana" : "semanas"}`
  if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} ${Math.floor(diffDays / 30) === 1 ? "mes" : "meses"}`
  return formatDistanceToNow(date, { locale: es, addSuffix: true })
}

export function formatLongDate(date: Date): string {
  return format(date, "d 'de' MMMM, yyyy", { locale: es })
}

export function daysAgo(days: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d
}
