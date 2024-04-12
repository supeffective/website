export type LegacyGame = {
  id: string
  name: string
  setId: string
  supersetId: string
}
export type LegacyGameDict = { [id in string]: LegacyGame }
