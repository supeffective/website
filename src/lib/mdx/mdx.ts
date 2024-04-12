import fs from 'node:fs'
import path from 'node:path'
import { globSync } from 'glob'
import matter from 'gray-matter'

import { MDXFileContent } from './types'

if (typeof window !== 'undefined') {
  throw new Error('This file should not be imported in the browser')
}

const cmsPath = path.resolve(process.env['CMS_PATH'] || path.join(process.cwd(), 'content'))
console.log('Resolved CMS path:', cmsPath)

export const getAllEntries = _createGetAllEntriesFn(cmsPath)

type MDXDataType = Record<string, unknown>

function _getAllMDXFiles<D extends MDXDataType>(dir: string): string[] {
  return globSync(`${dir}/**/*.mdx`)
}

function _getMDXFileContent<D extends MDXDataType>(baseDir: string, filePath: string): MDXFileContent<D> {
  const relativePath = filePath.replace(baseDir, '').replace(/(^\/|\/$)/g, '')
  const firstDir = relativePath.split('/').shift()

  const source = fs.readFileSync(filePath, 'utf8')
  const { data, content, ...rest } = matter(source)

  // dates to iso string
  Object.keys(data).forEach((key) => {
    if (data[key] instanceof Date) {
      data[key] = (data[key] as Date).toISOString()
    }
  })

  return {
    ...(data as D),
    _source: {
      file: relativePath,
      type: data.type || firstDir || undefined,
      content: String(rest.orig),
    },
    body: content,
  }
}

function _createGetAllEntriesFn(baseDir: string): (type: string) => MDXFileContent<any>[] {
  const allFiles = _getAllMDXFiles(baseDir)
  const entriesByDir = allFiles.reduce(
    (acc, file) => {
      const content = _getMDXFileContent(baseDir, file)
      if (!content._source.type) {
        throw new Error(`Missing type for MDX file: ${file}`)
      }

      const contentType = content._source.type.toLowerCase()

      if (!acc[contentType]) {
        acc[contentType] = []
      }
      acc[contentType].push(content)
      return acc
    },
    {} as Record<string, MDXFileContent<any>[]>,
  )

  return (type: string) => entriesByDir[type.toLowerCase()] || []
}
