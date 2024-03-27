export function createBoxTitle(gameSet: string, prevTitle: string | null | undefined, currentBoxNum: number): string {
  if (gameSet === 'go' || gameSet === 'lgpe') {
    return prevTitle || `Storage System`
  }
  if (prevTitle?.startsWith('Pasture') || prevTitle?.startsWith('Box')) {
    return createDefaultBoxTitle(gameSet, currentBoxNum)
  }
  return prevTitle ?? createDefaultBoxTitle(gameSet, currentBoxNum)
}

export function createDefaultBoxTitle(gameSet: string, currentBoxNum: number): string {
  if (gameSet === 'go' || gameSet === 'lgpe') {
    return `Storage System`
  }
  if (gameSet === 'la') {
    return `Pasture ${currentBoxNum}`
  }
  return `Box ${currentBoxNum}`
}
