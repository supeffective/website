import { DeserializedLivingDexDoc, LivingDexDocSpecConfig } from './types'

type Dex = DeserializedLivingDexDoc
export type MiddlewareContext<T extends Dex> = { dex: T; format: LivingDexDocSpecConfig }
export type Middleware<T extends Dex> = (context: MiddlewareContext<T>) => T

function applyMiddlewares<T extends Dex>(middlewares: Middleware<T>[], context: MiddlewareContext<T>) {
  if (middlewares.length === 0) {
    return context
  }
  const [middleware, ...rest] = middlewares

  return applyMiddlewares(rest, {
    dex: middleware(context),
    format: context.format,
  })
}

export function createMiddlewarePipeline<T extends Dex>(...middlewares: Middleware<T>[]): Middleware<T> {
  return (context: MiddlewareContext<T>) => applyMiddlewares(middlewares, context).dex
}
