import { DeserializedLivingDexDoc } from './types'

export function findPokemonInBoxes(searchId: string, dex: DeserializedLivingDexDoc): [number, number][] {
  const hits: [number, number][] = []
  for (let i = 0; i < dex.boxes.length; i++) {
    const box = dex.boxes[i]
    for (let j = 0; j < box.pokemon.length; j++) {
      const pokemon = box.pokemon[j]
      if (!pokemon) {
        continue
      }
      if (pokemon.id === searchId) {
        hits.push([i, j])
      }
    }
  }
  return hits
}
