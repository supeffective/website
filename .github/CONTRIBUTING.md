# SuperEffective Contributing Guide

Thanks for your interest to contribute to `SuperEffective`. Please take a moment and read through this guide:

## Repository

supereffective.gg is a Next.js app using turbo and pnpm. We use Node v20. The package manager used to install and link
dependencies must be [pnpm v8](https://pnpm.io/). It can be installed as:

```sh
npm install -g pnpm@8
```

Install the dependencies after forking and cloning the repository

```sh
pnpm install
```

## Developing

You can quickly test and debug your changes by running:

```sh
pnpm build
pnpm dev
```

Read the main [README](README.md) for more information about the project structure and the available commands.

## Testing

Since this project is undergoing a rewrite, at the moment we don't have tests for it, but you can run the linter and
build the project to make sure that at least the deployments won't be broken.

```sh
# On the root project dir
pnpm build
pnpm lint
```
