import fs from 'node:fs'

import errors from './errors'
import { getLivingDexFormat } from './formats'
import { LIVINGDEX_MAX_BOXES, LIVINGDEX_MAX_BOX_CAPACITY, parseLivingDex, serializeLivingDex } from './parser'
import { DeserializedLivingDexDoc, LivingDexDocBox, LivingDexDocMeta } from './types'

const dummyMarkdown = `
\`\`\`json
{
  "$id": "0KWyiHb83ASeezpAX1oy",
  "format": "v4",
  "gameId": "sv-v",
  "title": "Pokémon Scarlet - Living Dex",
  "ownerId": "supereffective",
  "creationTime": "2023-01-25T18:29:25+00:00",
  "lastUpdateTime": "2023-01-25T18:29:25+00:00"
}
\`\`\`

> some
> ignored
> lines

## Boxes

### Kanto 1;1;0

- pikachu;1;0;sv;jolly;;45;0;fairy;super;;jap;;;();(gmax,alpha,mighty,titan)
- 
- pikachu-f;1;1;xyoras;bold;infected;40;5;bug;cherish;;kor;(4,0,0,252,252,0);(4,0,0,31,31,0);(pound,pound,pound,pound);(gmax)
-
`

const dummyMarkdownMeta: LivingDexDocMeta = {
  $id: '0KWyiHb83ASeezpAX1oy',
  format: 'v4',
  gameId: 'sv-v',
  title: 'Pokémon Scarlet - Living Dex',
  ownerId: 'supereffective',
  creationTime: '2023-01-25T18:29:25+00:00',
  lastUpdateTime: '2023-01-25T18:29:25+00:00',
}

const dummyMarkdownBoxes: LivingDexDocBox[] = [
  {
    title: 'Kanto 1',
    shiny: true,
    pokemon: [
      {
        id: 'pikachu',
        captured: true,
        shiny: false,
        originMark: 'sv',
        nature: 'jolly',
        pokerus: undefined,
        level: 45,
        dynamaxLevel: 0,
        teraType: 'fairy',
        ball: 'super',
        item: undefined,
        language: 'jap',
        evs: [],
        ivs: [],
        moves: [],
        emblemMarks: ['gmax', 'alpha', 'mighty', 'titan'],
      },
      null,
      {
        id: 'pikachu-f',
        captured: true,
        shiny: true,
        originMark: 'xyoras',
        nature: 'bold',
        pokerus: 'infected',
        level: 40,
        dynamaxLevel: 5,
        teraType: 'bug',
        ball: 'cherish',
        item: undefined,
        language: 'kor',
        evs: [4, 0, 0, 252, 252, 0],
        ivs: [4, 0, 0, 31, 31, 0],
        moves: ['pound', 'pound', 'pound', 'pound'],
        emblemMarks: ['gmax'],
      },
      null,
    ],
  },
]

const formatV4 = '```{"format": "v4"}```'

function expect_toThrowWithCause(fn: () => any, cause: string) {
  expect(fn).toThrow(expect.objectContaining({ cause }))
}

describe('parseLivingDex', () => {
  it('succeeds (minimal info)', async () => {
    const dex = parseLivingDex(formatV4)

    expect(dex.format).toBe('v4')
    expect(dex.$id).toBeUndefined()
    expect(dex.boxes).toBeInstanceOf(Array)
    expect(dex.boxes).toHaveLength(0)
  })

  it('succeeds (minimal info) with json tag', async () => {
    const dex = parseLivingDex('```json{"format": "v4"}```')

    expect(dex.format).toBe('v4')
    expect(dex.$id).toBeUndefined()
    expect(dex.boxes).toBeInstanceOf(Array)
    expect(dex.boxes).toHaveLength(0)
  })

  it('throws an error if JSON meta is missing', async () => {
    expect_toThrowWithCause(() => parseLivingDex(''), errors.LIVINGDEX.INVALID_MARKDOWN.cause)
    expect_toThrowWithCause(() => parseLivingDex('- pikachu'), errors.LIVINGDEX.INVALID_MARKDOWN.cause)
  })

  it('throws an error if JSON meta is invalid JSON', async () => {
    expect_toThrowWithCause(() => parseLivingDex('```"format": "v4"}```'), errors.LIVINGDEX.INVALID_MARKDOWN.cause)
  })

  it('throws an error if format is wrong', async () => {
    expect_toThrowWithCause(() => parseLivingDex('```{"format": "v3"}```'), errors.LIVINGDEX.INVALID_FORMAT.cause)
  })

  it('throws an error if pokemon is supplied before box', async () => {
    expect_toThrowWithCause(() => parseLivingDex(formatV4 + '\n- pikachu'), errors.LIVINGDEX.NO_BOXES_DETECTED.cause)
  })

  it('should throw an error if the boxes exceeds the configured limit', () => {
    const data = Array(LIVINGDEX_MAX_BOXES + 1)
      .fill('### Kanto 1')
      .join('\n')
    expect_toThrowWithCause(() => parseLivingDex(formatV4 + data), errors.LIVINGDEX.BOXES_LIMIT_EXCEEDED.cause)
  })

  it('should throw an error if the box pokemon count exceeds the configured limit', () => {
    const data = Array(LIVINGDEX_MAX_BOX_CAPACITY + 1)
      .fill('- pikachu')
      .join('\n')

    const dataWithBoxes = Array(10)
      .fill('### Kanto 1\n' + data)
      .join('\n')

    expect_toThrowWithCause(
      () => parseLivingDex(formatV4 + dataWithBoxes),
      errors.LIVINGDEX.BOX_ITEM_LIMIT_EXCEEDED.cause,
    )
  })

  it('should parse boxes and pokemon', () => {
    const dex = parseLivingDex(dummyMarkdown)
    expect(dex.boxes).toHaveLength(1)
    expect(dex.boxes[0].pokemon).toHaveLength(dummyMarkdownBoxes[0].pokemon.length)

    expect(dex).toEqual({
      ...dummyMarkdownMeta,
      boxes: dummyMarkdownBoxes,
    })
  })
})

describe('serializeLivingDex', () => {
  it('converts a living dex object into markdown and vice-versa, keeping the same data', () => {
    const dex: DeserializedLivingDexDoc = {
      ...dummyMarkdownMeta,
      boxes: dummyMarkdownBoxes,
    }
    const result = serializeLivingDex(dex, getLivingDexFormat('v4'))

    const expectedResult = `# LivingDex

\`\`\`json
{"$id":"0KWyiHb83ASeezpAX1oy","format":"v4","gameId":"sv-v","title":"Pokémon Scarlet - Living Dex","ownerId":"supereffective","creationTime":"2023-01-25T18:29:25+00:00","lastUpdateTime":"2023-01-25T18:29:25+00:00"}
\`\`\`

## Format

> **Box format**:
> \`### title:string:text;shiny:boolean\`
>
> **Pokémon format**:
> \`- id:string:slug; captured:boolean; shiny:boolean; originMark:string:slug; nature:string:slug; pokerus:string:slug; level:number:int; dynamaxLevel:number:int; teraType:string:slug; ball:string:slug; item:string:slug; language:string:slug; evs:number:int[]; ivs:number:int[]; moves:string:slug[]; emblemMarks:string:slug[]\`

## Boxes

### "Kanto 1";1
- pikachu;1;0;sv;jolly;;45;0;fairy;super;;jap;();();();(gmax,alpha,mighty,titan)
- ;
- pikachu-f;1;1;xyoras;bold;infected;40;5;bug;cherish;;kor;(4,0,0,252,252,0);(4,0,0,31,31,0);(pound,pound,pound,pound);(gmax)
- ;
`

    // fs.writeFileSync('result.txt', result)
    // fs.writeFileSync('expectedResult.txt', expectedResult)

    expect(result).toEqual(expectedResult)

    // convert back
    const convertedDex = parseLivingDex(result)

    expect(convertedDex).toEqual(dex)
  })
  it('converts a living dex object into markdown and vice-versa, without format info', () => {
    const dex: DeserializedLivingDexDoc = {
      ...dummyMarkdownMeta,
      boxes: dummyMarkdownBoxes,
    }
    const result = serializeLivingDex(dex, getLivingDexFormat('v4'), false)

    const expectedResult = `\`\`\`json
{"$id":"0KWyiHb83ASeezpAX1oy","format":"v4","gameId":"sv-v","title":"Pokémon Scarlet - Living Dex","ownerId":"supereffective","creationTime":"2023-01-25T18:29:25+00:00","lastUpdateTime":"2023-01-25T18:29:25+00:00"}
\`\`\`

## Boxes

### "Kanto 1";1
- pikachu;1;0;sv;jolly;;45;0;fairy;super;;jap;();();();(gmax,alpha,mighty,titan)
- ;
- pikachu-f;1;1;xyoras;bold;infected;40;5;bug;cherish;;kor;(4,0,0,252,252,0);(4,0,0,31,31,0);(pound,pound,pound,pound);(gmax)
- ;
`

    // fs.writeFileSync('result.txt', result)
    // fs.writeFileSync('expectedResult.txt', expectedResult)

    expect(result).toEqual(expectedResult)

    // convert back
    const convertedDex = parseLivingDex(result)

    expect(convertedDex).toEqual(dex)
  })

  it('parses a full living dex from a file, correcty', () => {
    const filename = __dirname + '/parser-data.txt'
    const filecontent = fs.readFileSync(filename, 'utf-8')
    parseLivingDex(filecontent)
  })
})
