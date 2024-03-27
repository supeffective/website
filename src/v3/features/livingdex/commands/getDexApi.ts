import { ApiResponse, apiErrors } from '@/v3/lib/utils/types'
import { isValidIdSchema } from '@/v3/lib/validation/schemas'

import { getLegacyLivingDexRepository } from '../repository/index'

export const getDexApi = async (dexId: string): Promise<ApiResponse> => {
  if (!isValidIdSchema(dexId)) {
    return apiErrors.invalidRequest
  }

  const dex = await getLegacyLivingDexRepository().getById(dexId)

  if (!dex) {
    return apiErrors.notFound
  }

  return {
    statusCode: 200,
    data: dex,
  }
}
