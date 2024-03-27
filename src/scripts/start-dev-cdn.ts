import fs from 'node:fs'
import path from 'node:path'
import { $ } from 'bun'
import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'
import { cors } from 'hono/cors'

const cdnDir = path.join('./.local', 'cdn')
if (!fs.existsSync(cdnDir)) {
  fs.mkdirSync(cdnDir, { recursive: true })
}

const repos = [
  { 'supereffective-assets': 'git@github.com:supeffective/assets.git' },
  { 'supereffective-dataset': 'git@github.com:supeffective/dataset.git' },
]

console.log('Setting up local CDN...')
for (const repo of repos) {
  const [name, url] = Object.entries(repo)[0]
  const repoDir = path.join(cdnDir, name)
  const repoNodeModulesDir = path.join(repoDir, 'node_modules')
  const setupMarkerFile = path.join(cdnDir, `${name}-setup.log`)

  if (!fs.existsSync(repoDir)) {
    console.log(`Cloning ${name}...`)
    await $`git clone ${url} ${repoDir}`
  }

  if (!fs.existsSync(repoNodeModulesDir)) {
    console.log(`Installing missing ${name} dependencies...`)
    await $`cd '${repoDir}' && pnpm install`
  }

  if (!fs.existsSync(setupMarkerFile)) {
    console.log(`Building ${name}....`)
    await $`cd '${repoDir}' && pnpm build`
    fs.writeFileSync(setupMarkerFile, `Setup at ${new Date().toISOString()}`)
  }
}

const app = new Hono()
app.use(
  cors({
    origin: (origin) => origin ?? '*', // Allow all origins by default
    allowHeaders: ['Content-Type'],
    allowMethods: ['GET', 'OPTIONS'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: true,
  }),
)

app.get('/', (c) => {
  return c.text('Hello from Hono!')
})
app.use(
  '/assets/*',
  serveStatic({
    root: `${cdnDir}/supereffective-assets`,
    // mimes: mimeTypes,
    onNotFound: (path, c) => {
      console.log(`${path} is not found, you access ${c.req.path}`)
    },
  }),
)
app.use(
  '/data/src/*',
  serveStatic({
    root: `${cdnDir}/supereffective-dataset`,
    // mimes: mimeTypes,
    rewriteRequestPath: (path) => path.replace(/^\/data\/src/, '/data'),
    onNotFound: (path, c) => {
      console.log(`${path} is not found, you access ${c.req.path}`)
    },
  }),
)
app.use(
  '/data/*',
  serveStatic({
    root: `${cdnDir}/supereffective-dataset`,
    // mimes: mimeTypes,
    rewriteRequestPath: (path) => path.replace(/^\/data/, '/dist/data'),
    onNotFound: (path, c) => {
      console.log(`${path} is not found, you access ${c.req.path}`)
    },
  }),
)

export default app
