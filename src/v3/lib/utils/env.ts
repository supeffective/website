export function hasDevFeaturesEnabled(): boolean {
  return isDevelopmentEnv() && !isCI()
}

export function isProductionEnv(): boolean {
  return _getEnvName() === 'production' || _getEnvName() === 'prod'
}

export function isDevelopmentEnv(): boolean {
  return _getEnvName() === 'development' || _getEnvName() === 'dev'
}

export function isLocalDevelopmentEnv(): boolean {
  return isDevelopmentEnv() && !isCI() && !isVercel()
}

export function isLocalAssetsEnabled(): boolean {
  const envVarValue = process.env['LOCAL_ASSETS_ENABLED'] ?? process.env['NEXT_PUBLIC_LOCAL_ASSETS_ENABLED']

  return isDevelopmentEnv() && (String(envVarValue) === '1' || String(envVarValue) === 'true')
}

export function isPreviewEnv(): boolean {
  return _getEnvName() === 'preview'
}

export function isServerSide(): boolean {
  return typeof window === 'undefined'
}

export function isClientSide(): boolean {
  return typeof window !== 'undefined'
}

function _getEnvName(): string {
  return (
    process.env.APP_ENV ??
    process.env.NEXT_PUBLIC_APP_ENV ??
    process.env.VERCEL_ENV ??
    process.env.NODE_ENV ??
    'development'
  )
}

export function isVercel(): boolean {
  return process.env.VERCEL === '1' || process.env.VERCEL === 'true'
}

export function isCI(): boolean {
  return process.env.CI === '1' || process.env.CI === 'true'
}

export function isDebugEnabled(): boolean {
  return process.env.APP_DEBUG === '1' || process.env.APP_DEBUG === 'true'
}

export function isGithubActions(): boolean {
  return process.env.GITHUB_ACTIONS === '1' || process.env.GITHUB_ACTIONS === 'true'
}
