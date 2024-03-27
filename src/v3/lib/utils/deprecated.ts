/**
 * @deprecated use cn from '@/lib/utils'
 */
export const classNames = (...args: (string | undefined | null)[]): string => {
  // filter(Boolean) filters out falsy values: false, 0, 0, 0n, "", null, undefined, NaN
  return args.filter(Boolean).join(' ').trim()
}

/**
 * @deprecated use cn from '@/lib/utils'
 */
export const classNameIf = (
  condition: boolean | undefined | null,
  trueClassName: string | undefined | null,
  falseClassName?: string | undefined | null,
): string => {
  return condition === true ? classNames(trueClassName) : classNames(falseClassName)
}
