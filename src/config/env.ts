function getEnvName() {
  return process.env.VERCEL_ENV ?? process.env.NODE_ENV
}

export function isServerSide() {
  return typeof window === 'undefined' && typeof document === 'undefined'
}

export function isClientSide() {
  return !isServerSide()
}

export function assertServerOnly() {
  if (isClientSide()) {
    throw new Error('This file should not be imported in the browser')
  }
}

export function isDevelopmentEnv() {
  return getEnvName() === 'development'
}

export function isProductionEnv() {
  return getEnvName() === 'production'
}

export function isPreviewEnv() {
  return getEnvName() === 'preview'
}

export function isDebugEnabled() {
  return process.env.DEBUG === 'true' || process.env.DEBUG === '1'
}

export function isVercel(): boolean {
  return process.env.VERCEL === '1' || process.env.VERCEL === 'true'
}

export function isCI(): boolean {
  return process.env.CI === '1' || process.env.CI === 'true'
}

export function isGithubActions(): boolean {
  return process.env.GITHUB_ACTIONS === '1' || process.env.GITHUB_ACTIONS === 'true'
}

export function isLocalAssetsEnabled(): boolean {
  const envVarValue = process.env.LOCAL_ASSETS_ENABLED ?? process.env.NEXT_PUBLIC_LOCAL_ASSETS_ENABLED

  return isDevelopmentEnv() && (String(envVarValue) === '1' || String(envVarValue) === 'true')
}
