import { ApiResponse, apiErrors } from '@/v3/lib/utils/types'
import { isValidIdSchema } from '@/v3/lib/validation/schemas'

import { getLegacyLivingDexRepository } from '../repository/index'
import { LoadedDex } from '../repository/types'
import { getDexApi } from './getDexApi'

export const removeDexApi = async (dexId: string, currentUserId: string): Promise<ApiResponse> => {
  if (!isValidIdSchema(dexId) || !isValidIdSchema(currentUserId)) {
    return apiErrors.invalidRequest
  }

  const resp = await getDexApi(dexId)

  if (resp.statusCode !== 200) {
    return { ...resp, data: [] }
  }

  const isOwner = (resp.data as LoadedDex).userId === currentUserId

  if (!isOwner) {
    return apiErrors.notAuthorized
  }

  await getLegacyLivingDexRepository().remove(dexId)

  return {
    statusCode: 200,
    data: [dexId],
  }
}
