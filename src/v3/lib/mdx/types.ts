export type MDXFileContent<DataType extends Record<string, unknown>> = {
  _source: {
    file: string
    type: string | undefined
    content: string
  }
  body: string
} & DataType
