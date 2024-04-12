// Avoids TS to infer the type of large JSON files
// @see https://www.totaltypescript.com/override-the-type-of-a-json-file
// Valid extensions: .min.json -> .min.d.json.ts, .json -> .d.json.ts

declare const data: any

export default data
