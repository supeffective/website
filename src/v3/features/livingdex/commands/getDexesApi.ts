import { ApiResponse, apiErrors } from '@/v3/lib/utils/types'
import { isValidIdSchema } from '@/v3/lib/validation/schemas'

import { getLegacyLivingDexRepository } from '../repository/index'

export const getDexesApi = async (userId: string): Promise<ApiResponse> => {
  if (!isValidIdSchema(userId)) {
    return apiErrors.invalidRequest
  }

  const dexes = await getLegacyLivingDexRepository().getManyByUser(userId)

  return {
    statusCode: 200,
    data: dexes,
  }
}
