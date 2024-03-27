import { log } from 'next-axiom'

import { isDebugEnabled, isProductionEnv } from './env'

export const logger = log

export function dd(...args: any[]): void {
  if (!isDebugEnabled()) {
    return
  }
  devLog(...args)
}

export const devLog = (...args: any[]): void => {
  if (isProductionEnv()) {
    return
  }
  if (args.length === 0) {
    return
  }

  let fnName = 'debug'
  if (['log', 'info', 'warn', 'error'].includes(args[0])) {
    fnName = args.shift()
  }

  const fn = (console as any)[fnName]

  const prefix = '[dev debug]'
  const cssStyles = 'color: #fff; background-color: #843065; padding: 2px 3px;'

  fn('%c' + prefix, cssStyles, ...args)
}

export const devLogger = {
  debug: (...args: any[]): void => devLog('debug', ...args),
  log: (...args: any[]): void => devLog('log', ...args),
  info: (...args: any[]): void => devLog('info', ...args),
  warn: (...args: any[]): void => devLog('warn', ...args),
  error: (...args: any[]): void => devLog('error', ...args),
}
