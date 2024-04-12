export type SearchCollectionItem = { id: string }
export type SearchCollection = SearchCollectionItem[]

export interface SearchEngine<C extends SearchCollection = SearchCollection> {
  readonly algo: SearchAlgorithm

  build(collection: C, properties: any[]): SearchEngine<C>

  search(text: string): Set<string>

  searchCollection<T extends SearchCollection>(collection: T, text: string): T
}

export enum SearchAlgorithm {
  Simple = 'simple',
}
