import { isDevelopmentEnv } from '@/v3/lib/utils/env'

const featureFlags = {
  core: {
    website: true,
    database: true,
  },
  services: {
    patreon: true,
    mailing: true,
  },
  signIn: true,
}

export function isBasicServicesEnabled(): boolean {
  return featureFlags.services.mailing && featureFlags.core.database && featureFlags.core.website
}

export function hasDevFeaturesEnabled(): boolean {
  return isDevelopmentEnv()
}

export function hasPatreonFeaturesEnabled(): boolean {
  return featureFlags.services.patreon
}

export function isSignInEnabled(): boolean {
  return isBasicServicesEnabled() && featureFlags.signIn
}

export function isWebsiteInMaintenanceMode(): boolean {
  return featureFlags.core.website === false
}
