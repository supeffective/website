import { SearchAlgorithm, SearchCollection, SearchEngine } from './types'

export class SimpleSearchIndex<C extends SearchCollection = SearchCollection> implements SearchEngine {
  static TOKEN_SEPARATOR = ':'
  readonly algo: SearchAlgorithm.Simple = SearchAlgorithm.Simple
  index: Map<string, string> = new Map()

  buildWithTokens(collection: C, tokens: [string, (item: any) => string[]][]): SimpleSearchIndex<C> {
    this.index = new Map()
    const sep = SimpleSearchIndex.TOKEN_SEPARATOR

    for (const item of collection) {
      if (this.index.has(item.id)) {
        throw new Error(`The index already has the item with key: ${item.id}`)
      }

      let fullText = ''

      for (const [prop, propValueFn] of tokens) {
        let propValues: unknown = propValueFn(item)
        if (!propValues) {
          continue
        }
        if (!Array.isArray(propValues)) {
          propValues = [propValues]
        }

        // support many values
        for (let propValue of propValues as Array<unknown>) {
          if (typeof propValue === 'number') {
            propValue = String(propValue)
          }
          if (typeof propValue !== 'string' || propValue === '') {
            continue
          }
          const minifiedValue = propValue.replace(/\s/g, '')
          fullText = `${fullText} ${prop}${sep}${propValue}`
          if (propValue !== minifiedValue) {
            fullText = `${fullText} ${prop}${sep}${minifiedValue}`
          }
        }
      }

      fullText = fullText.trim().toLowerCase()

      if (fullText !== '') {
        this.index.set(item.id, fullText)
      }
    }

    return this
  }

  build(collection: C, properties: string[]): SimpleSearchIndex<C> {
    this.index = new Map()
    const sep = SimpleSearchIndex.TOKEN_SEPARATOR

    for (const item of collection) {
      if (this.index.has(item.id)) {
        throw new Error(`The index already has the item with key: ${item.id}`)
      }

      let fullText = ''

      for (const prop of properties) {
        let propValues: unknown = (item as Record<string, unknown>)[prop]
        if (!propValues) {
          continue
        }
        if (!Array.isArray(propValues)) {
          propValues = [propValues]
        }

        // support many values
        for (let propValue of propValues as Iterable<unknown>) {
          if (typeof propValue === 'number') {
            propValue = String(propValue)
          }
          if (typeof propValue !== 'string' || propValue === '') {
            continue
          }
          const minifiedValue = propValue.replace(/\s/g, '')
          fullText = `${fullText} ${prop}${sep}${propValue}`
          if (propValue !== minifiedValue) {
            fullText = `${fullText} ${prop}${sep}${minifiedValue}`
          }
        }
      }

      fullText = fullText.trim().toLowerCase()

      if (fullText !== '') {
        this.index.set(item.id, fullText)
      }
    }

    return this
  }

  search(text: string): Set<string> {
    if (!text || text === '' || text === '*') {
      return new Set(this.index.keys())
    }
    const hits: Set<string> = new Set()
    const sanitizedText = text.replace(/\s+/g, ' ').trim().toLowerCase()
    if (sanitizedText === '') {
      return hits
    }
    const tokens = sanitizedText.split(' ')

    return new Set(
      Array.from(this.index)
        .filter((entry) => {
          return tokens.some((token) => entry[1].includes(token))
        })
        .map((entry) => entry[0]),
    )
  }

  searchCollection<C extends SearchCollection>(collection: C, text: string): C {
    if (!text) {
      return collection
    }
    const hits = this.search(text)

    if (hits.size === 0) {
      return [] as SearchCollection as C
    }

    return collection.filter((item) => hits.has(item.id)) as C
  }
}
