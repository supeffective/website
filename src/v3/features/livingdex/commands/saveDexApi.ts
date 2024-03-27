import { migratePokemonId, migratePokemonNid } from '@/v3/lib/data-client/migrations'
import { getPokemonIds } from '@/v3/lib/data-client/pokemon'
import { jsonDecode } from '@/v3/lib/utils/serialization/jsonSerializable'
import { ApiResponse, apiErrors } from '@/v3/lib/utils/types'
import { isValidIdSchema } from '@/v3/lib/validation/schemas'

import { getLegacyLivingDexRepository } from '../repository/index'
import { LoadedDexSchema } from '../repository/schemas'
import { LoadedDex, NullableDexPokemon } from '../repository/types'

async function _canCreateMoreDexes(dexes: LoadedDex[], currentUserId: string): Promise<boolean> {
  const limits = await getLegacyLivingDexRepository().getLimitsForUser(currentUserId)
  return dexes.length < limits.maxDexes
}

const validPokemonIds = getPokemonIds()

function sanitizeDex(dex: LoadedDex): LoadedDex {
  for (const i in dex.boxes) {
    const box = dex.boxes[i]
    const sanitizedPokemon: NullableDexPokemon[] = []

    for (const j in box.pokemon) {
      const pkm = box.pokemon[j]
      if (!pkm) {
        sanitizedPokemon.push(pkm)
        continue
      }
      pkm.pid = migratePokemonId(pkm.pid)
      pkm.nid = migratePokemonNid(pkm.nid)
      if (!validPokemonIds.includes(pkm.pid as any)) {
        // Skip entry if it has an invalid pokemon ID
        sanitizedPokemon.push(null)
        console.error(`[sanitizeDex] Invalid pokemon PID found: ${pkm.pid}`, `DEX ID: ${dex.id}`)
        continue
      }
      sanitizedPokemon.push(pkm)
    }

    dex.boxes[i].pokemon = sanitizedPokemon
  }

  return {
    ...dex,
    userId: undefined,
  }
}

export const saveDexApi = async (data: string | undefined | null, currentUserId: string): Promise<ApiResponse> => {
  const dex: LoadedDex = sanitizeDex(jsonDecode(data || '{}'))
  const validation = LoadedDexSchema.safeParse(dex)

  if (!isValidIdSchema(currentUserId)) {
    return apiErrors.notAuthorized
  }

  if (!validation.success) {
    return {
      statusCode: 400,
      data: {
        message: validation.error.message,
      },
    }
  }

  const userDexes = await getLegacyLivingDexRepository().getManyByUser(currentUserId)
  const isNew = dex.id === undefined || dex.id === null

  if (isNew && !_canCreateMoreDexes(userDexes, currentUserId)) {
    return {
      statusCode: 400,
      data: {
        message: 'You cannot create more dexes with your current Tier, please support us via Patreon.',
      },
    }
  }

  const isOwner = dex.userId === currentUserId

  if (dex.userId !== undefined && !isOwner) {
    return apiErrors.notAuthorized
  }

  const savedDex = await getLegacyLivingDexRepository().save(dex, currentUserId)

  return {
    statusCode: 200,
    data: savedDex,
  }
}
