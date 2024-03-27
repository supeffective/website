export function cleanupSpaces(str: string) {
  return (str || '').trim().replace(/(\s+|\n)/g, ' ')
}

export function slugify(str: string) {
  return cleanupSpaces(str)
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
}

export function camelize(str: string) {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
}

export function lowerCaseFirst(str: string) {
  return str.charAt(0).toLowerCase() + str.slice(1)
}

export function upperCaseFirst(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function trimChars(str: string, chars = ' \\n\\t') {
  return str.replace(new RegExp(`^[${chars}]+|[${chars}]+$`, 'g'), '')
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function titleize(str: string) {
  return str
    .split('-')
    .map((s) => capitalize(s))
    .join(' ')
}
