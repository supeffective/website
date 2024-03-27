import { z } from 'zod'

import errors from './errors'
import { getLivingDexFormat } from './formats'
import { applyDefaultMiddlewares } from './middlewares'
import {
  DeserializedLivingDexDoc,
  LivingDexDocBox,
  LivingDexDocMeta,
  LivingDexDocPokemon,
  LivingDexDocSpecConfig,
  LivingDexDocSpecPropType,
} from './types'
import { createLivingDexBoxValidator, createLivingDexMetadataValidator } from './validator'

const markdownRegex = /```(json)?\n?(?<jsonCode>[\S\s]+)\n?```(?<mdCode>\n?[\S\s]+)?/gm

export const LIVINGDEX_MAX_BOXES = 200
export const LIVINGDEX_MAX_BOX_CAPACITY = 30

export function parseLivingDex(markdown: string): DeserializedLivingDexDoc {
  const matches = Array.from(markdown.matchAll(markdownRegex))

  if (
    matches.length === 0 ||
    matches[0] === undefined ||
    matches[0].groups === undefined ||
    matches[0].groups.jsonCode === undefined
  ) {
    throw new Error('Invalid LivingDex markdown document', errors.LIVINGDEX.INVALID_MARKDOWN)
  }

  const jsonCode = matches[0].groups.jsonCode.trim()
  const mdBoxLines = (matches[0].groups.mdCode || '').trim().split('\n')

  let meta: LivingDexDocMeta
  try {
    meta = JSON.parse(jsonCode)
  } catch (error) {
    throw new Error('LivingDex metadata contains invalid JSON', errors.LIVINGDEX.INVALID_MARKDOWN)
  }

  const format = getLivingDexFormat(meta.format)
  try {
    const boxes = parseBoxes(mdBoxLines, format)

    const dex = {
      ...meta,
      boxes,
    }

    return applyDefaultMiddlewares({ dex, format })
  } catch (error: any) {
    const newErr = new Error(
      `LivingDex boxes contains invalid data for dex ID '${meta.$id ?? '(new)'}' and owner ID '${
        meta.ownerId
      }'. Error was: "${error}"`,
    )

    newErr.stack = error.stack
    newErr.cause = error.cause

    throw newErr
  }
}

export function validateLivingDex(metadata: object, boxes: object[]): void {
  const meta = createLivingDexMetadataValidator().parse(metadata)
  const format = getLivingDexFormat(meta.format)

  z.array(createLivingDexBoxValidator(format)).parse(boxes)
}

export function serializeLivingDexMeta(meta: LivingDexDocMeta | Partial<LivingDexDocMeta>): string {
  return '```json\n' + JSON.stringify(meta) + '\n```\n'
}

export function serializeLivingDex(
  deserializedDex: DeserializedLivingDexDoc,
  format: LivingDexDocSpecConfig,
  verboseInfo = true,
): string {
  const {
    boxPrefix,
    pokemonPrefix,
    propertySeparator,
    boxProperties,
    pokemonProperties,
    arrayDelimiters,
    arraySeparator,
  } = format

  const dex = applyDefaultMiddlewares({ dex: deserializedDex, format })

  const meta: LivingDexDocMeta = {
    $id: dex.$id,
    format: dex.format,
    gameId: dex.gameId,
    title: dex.title,
    ownerId: dex.ownerId,
    creationTime: dex.creationTime,
    lastUpdateTime: dex.lastUpdateTime,
    legacyPresetId: dex.legacyPresetId,
    legacyPresetVersion: dex.legacyPresetVersion,
  }

  const metaLines = verboseInfo ? ['# LivingDex\n', serializeLivingDexMeta(meta)] : [serializeLivingDexMeta(meta)]

  // add formatting infos
  const boxPropsInfos = []
  for (const [propName, propType] of boxProperties) {
    boxPropsInfos.push(`${propName}:${propType}`)
  }
  const pokePropsInfos = []
  for (const [propName, propType] of pokemonProperties) {
    pokePropsInfos.push(`${propName}:${propType}`)
  }

  if (verboseInfo) {
    metaLines.push('## Format')
    metaLines.push('')
    metaLines.push('> **Box format**:')
    metaLines.push(`> \`${boxPrefix} ` + boxPropsInfos.join(propertySeparator) + '`')
    metaLines.push('>')
    metaLines.push(`> **Pokémon format**:`)
    metaLines.push(`> \`${pokemonPrefix} ` + pokePropsInfos.join(propertySeparator + ' ') + '`\n')
  }

  metaLines.push('## Boxes')
  metaLines.push('')

  // add boxes and pokemon
  for (const box of dex.boxes) {
    metaLines.push(
      boxPrefix + ' ' + collectPropValues(box, boxProperties, arrayDelimiters, arraySeparator).join(propertySeparator),
    )

    for (const pokemon of box.pokemon) {
      if (!pokemon) {
        metaLines.push(pokemonPrefix + ' ' + propertySeparator)
        continue
      }
      metaLines.push(
        pokemonPrefix +
          ' ' +
          collectPropValues(pokemon, pokemonProperties, arrayDelimiters, arraySeparator).join(propertySeparator),
      )
    }
  }

  return metaLines.join('\n') + '\n'
}

function convertLivingDexValue(
  value: string | undefined,
  type: LivingDexDocSpecPropType,
  format: LivingDexDocSpecConfig,
): string | boolean | number | string[] | number[] | undefined {
  if (value === null || value === '' || value === undefined) {
    return type.endsWith('[]') ? [] : undefined
  }
  const textDelimitersRegex = /^["']|["']$/g
  const arrayDelimitersRegex = new RegExp(
    `^\\` + `${format.arrayDelimiters[0]}|` + '\\' + `${format.arrayDelimiters[1]}$`,
    'g',
  )

  switch (type) {
    case 'boolean':
      return ['1', 'true', 'yes', 'y', 'ok'].includes(value.toLowerCase())
    case 'number':
      return Number.parseFloat(value)
    case 'number[]':
      return value
        .replace(arrayDelimitersRegex, '')
        .split(format.arraySeparator)
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .map((s) => Number.parseFloat(s.trim()))
    case 'number:int':
      return Number.parseInt(value)
    case 'number:int[]':
      return value
        .replace(arrayDelimitersRegex, '')
        .split(format.arraySeparator)
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .map((s) => Number.parseInt(s.trim()))
    case 'string':
    case 'string:slug':
      return value.trim()
    case 'string:text':
      return value.replace(textDelimitersRegex, '').trim()
    case 'string[]':
    case 'string:slug[]':
      return value
        .replace(arrayDelimitersRegex, '')
        .split(format.arraySeparator)
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .map((s) => s.trim())
    default:
      throw new Error(`Invalid prop type: ${type}`, errors.LIVINGDEX.INVALID_PROP_TYPE)
  }
}

function parseBoxProps(line: string, format: LivingDexDocSpecConfig): LivingDexDocBox {
  const data = new Map<string, unknown>()
  const lineData = line
    .replace(new RegExp('^' + format.boxPrefix), '')
    .trim()
    .split(format.propertySeparator)

  for (const propIdx in format.boxProperties) {
    const [propName, propType] = format.boxProperties[propIdx]
    const propValue = convertLivingDexValue(lineData[propIdx], propType, format)
    data.set(propName, propValue)
  }

  data.set('pokemon', [])

  return Object.fromEntries(Array.from(data.entries())) as unknown as LivingDexDocBox
}

function parsePokemonProps(line: string, format: LivingDexDocSpecConfig): LivingDexDocPokemon | null {
  const data = new Map<string, unknown>()
  const lineData = line
    .replace(new RegExp('^' + format.pokemonPrefix), '')
    .trim()
    .split(format.propertySeparator)

  if (lineData.length === 0) {
    return null
  }

  if (
    lineData.length >= 1 &&
    (lineData[0] === '' ||
      lineData[0] === '~' ||
      lineData[0] === '-' ||
      lineData[0] === format.propertySeparator ||
      lineData[0] === 'null')
  ) {
    return null
  }

  for (const propIdx in format.pokemonProperties) {
    const [propName, propType] = format.pokemonProperties[propIdx]
    const propValue = convertLivingDexValue(lineData[propIdx], propType, format)
    data.set(propName, propValue)
  }

  return Object.fromEntries(data.entries()) as unknown as LivingDexDocPokemon
}

function parseBoxes(lines: string[], format: LivingDexDocSpecConfig): LivingDexDocBox[] {
  const boxes: LivingDexDocBox[] = []

  // TODO limits depending on meta.gameId

  for (const line of lines) {
    // TODO: support migrate from older formats

    // is a new box
    if (line.startsWith(format.boxPrefix)) {
      if (boxes.length >= LIVINGDEX_MAX_BOXES) {
        throw new Error('Boxes limit exceeded', errors.LIVINGDEX.BOXES_LIMIT_EXCEEDED)
      }
      boxes.push(parseBoxProps(line, format))
      continue
    }

    // ignore this line
    if (!line.startsWith(format.pokemonPrefix)) {
      continue
    }

    // is a Pokémon, add it to current box
    if (boxes.length === 0) {
      throw new Error('No boxes detected. Cannot add Pokémon.', errors.LIVINGDEX.NO_BOXES_DETECTED)
    }
    const currentBox = boxes[boxes.length - 1]
    if (
      boxes.length > 4 && // Not GO or LGPE
      currentBox.pokemon &&
      currentBox.pokemon.length >= LIVINGDEX_MAX_BOX_CAPACITY
    ) {
      throw new Error(
        'Box Pokémon limit exceeded for box with title: ' + currentBox.title,
        errors.LIVINGDEX.BOX_ITEM_LIMIT_EXCEEDED,
      )
    }
    const pokeData = parsePokemonProps(line, format)
    currentBox.pokemon.push(pokeData)
  }

  return boxes
}

function collectPropValues<T extends LivingDexDocBox | LivingDexDocPokemon>(
  data: T,
  props: [keyof T, LivingDexDocSpecPropType][],
  arrayDelimiters: [string, string],
  arraySeparator: string,
): string[] {
  const values: string[] = []
  if (typeof data !== 'object') {
    throw new Error('Unexpected data type')
  }
  for (const [propName, propType] of props) {
    let val: unknown = data[propName]
    if (val === undefined || val === null || val === '') {
      val = ''
    } else if (propType.endsWith('[]')) {
      if (!val) {
        val = []
      }
      if (!Array.isArray(val)) {
        throw new Error(
          propType + ' should be an array. Found type: ' + typeof val,
          errors.LIVINGDEX.INVALID_PROP_VALUE,
        )
      }
      val = arrayDelimiters[0] + val.map((v) => String(v)).join(arraySeparator) + arrayDelimiters[1]
    } else if (propType === 'string:text') {
      val = `"${val}"`
    } else if (propType === 'boolean') {
      val = val ? '1' : '0'
    }
    values.push(String(val))
  }

  return values
}
