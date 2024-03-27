export function migratePokemonNid(pokemonNid: string): string {
  const migrationMap: Record<string, string> = {
    '0925-four': '0925',
    '0978-sketchy': '0978-stretchy',
  }

  if (migrationMap[pokemonNid]) {
    return migrationMap[pokemonNid]
  }

  return pokemonNid
}

export function migratePokemonId(pokemonId: string): string {
  const migrationMap: Record<string, string> = {
    'maushold-four': 'maushold',
    'tatsugiri-sketchy': 'tatsugiri-stretchy',
  }

  if (migrationMap[pokemonId]) {
    return migrationMap[pokemonId]
  }

  return pokemonId
}
