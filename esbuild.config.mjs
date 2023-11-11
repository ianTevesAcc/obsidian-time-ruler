import esbuild from 'esbuild'
import process from 'process'
import builtins from 'builtin-modules'
import postcss from 'esbuild-postcss'
import esBuildCopyStaticFiles from 'esbuild-copy-static-files'

const banner = `/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/
`

const MODE = process.env.MODE
const VAULT = process.env.VAULT

let entryPoints = [`src/main.ts`, `src/styles.css`]

const plugins = [
  postcss(),
  esBuildCopyStaticFiles({
    src: `manifest.json`,
    dest: `dist/manifest.json`,
    dereference: true,
    errorOnExist: false,
    preserveTimestamps: true,
  }),
]

if (VAULT) {
  plugins.push(
    esBuildCopyStaticFiles({
      src: `dist`,
      dest: `${VAULT}/.obsidian/plugins/time-ruler`,
      dereference: true,
      errorOnExist: false,
      preserveTimestamps: true,
    })
  )
}

const context = await esbuild.context({
  banner: {
    js: banner,
  },
  entryPoints,
  bundle: true,
  external: [
    'obsidian',
    'electron',
    '@codemirror/autocomplete',
    '@codemirror/collab',
    '@codemirror/commands',
    '@codemirror/language',
    '@codemirror/lint',
    '@codemirror/search',
    '@codemirror/state',
    '@codemirror/view',
    '@lezer/common',
    '@lezer/highlight',
    '@lezer/lr',
    ...builtins,
  ],
  format: 'cjs',
  target: 'es2018',
  logLevel: 'info',
  sourcemap: MODE === 'production' ? false : 'inline',
  treeShaking: true,
  outdir: 'dist',

  loader: {
    '.mp3': 'dataurl',
    '.svg': 'text',
    '.png': 'dataurl',
  },
  plugins,
})

if (MODE === 'production') {
  await context.rebuild()
  process.exit(0)
} else {
  await context.watch()
}
