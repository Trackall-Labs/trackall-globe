// Generates apps/www/public/og.png using @vercel/og.
// Run with: npm run generate:og  (from apps/www)
import { ImageResponse } from '@vercel/og'
import { createElement as h } from 'react'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const TITLE = 'devl.dev'
const TAGLINE = "Sean's scratch pad"
const SUBTITLE = 'UI experiments built on coss-ui'
const STATS = ['159+ components', 'shadcn registry', "press 'c' to copy"]

const [geistRegular, geistSemibold, logoBytes] = await Promise.all([
  readFile(resolve(root, 'public/fonts/Geist-Regular.ttf')),
  readFile(resolve(root, 'public/fonts/Geist-SemiBold.ttf')),
  readFile(resolve(root, 'public/og-logo.png')),
])

const logoDataUrl = `data:image/png;base64,${logoBytes.toString('base64')}`

// Mirrors @orbit/ui Badge `outline` variant at `lg` size: rounded-sm,
// border-input bg-background, font-medium, dark-mode background tint.
const Badge = (label) =>
  h(
    'div',
    {
      style: {
        display: 'flex',
        alignItems: 'center',
        height: 36,
        padding: '0 10px',
        borderRadius: 4,
        border: '1px solid rgba(255,255,255,0.14)',
        background: 'rgba(255,255,255,0.06)',
        color: 'rgba(255,255,255,0.92)',
        fontSize: 18,
        fontWeight: 500,
        fontFamily: 'Geist',
        letterSpacing: -0.1,
      },
    },
    label,
  )

const tree = h(
  'div',
  {
    style: {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: 80,
      background: '#0a0a0a',
      backgroundImage:
        'radial-gradient(circle at 20% 0%, rgba(120, 119, 198, 0.18), transparent 50%), radial-gradient(circle at 80% 100%, rgba(255, 119, 153, 0.12), transparent 50%)',
      color: 'white',
      fontFamily: 'Geist',
      position: 'relative',
    },
  },
  // grid overlay
  h('div', {
    style: {
      position: 'absolute',
      inset: 0,
      backgroundImage:
        'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
      backgroundSize: '60px 60px',
    },
  }),

  // top row — wordmark + meta
  h(
    'div',
    {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
    },
    h(
      'div',
      {
        style: { display: 'flex', alignItems: 'center', gap: 14 },
      },
      h('img', {
        src: logoDataUrl,
        width: 44,
        height: 44,
        style: { display: 'block' },
      }),
      h(
        'div',
        { style: { fontSize: 28, fontWeight: 600, letterSpacing: -0.5 } },
        TAGLINE,
      ),
    ),
    h(
      'div',
      {
        style: {
          fontSize: 22,
          color: 'rgba(255,255,255,0.55)',
        },
      },
      'devl.dev',
    ),
  ),

  // headline block
  h(
    'div',
    {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      },
    },
    h(
      'div',
      {
        style: {
          fontSize: 132,
          fontWeight: 600,
          letterSpacing: -4,
          lineHeight: 1,
          background:
            'linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.6) 100%)',
          backgroundClip: 'text',
          color: 'transparent',
        },
      },
      TITLE,
    ),
    h(
      'div',
      {
        style: {
          fontSize: 40,
          color: 'rgba(255,255,255,0.78)',
          letterSpacing: -1,
          maxWidth: 900,
          lineHeight: 1.2,
        },
      },
      SUBTITLE,
    ),
  ),

  // bottom row — pills
  h(
    'div',
    {
      style: { display: 'flex', gap: 14 },
    },
    ...STATS.map((s) => Badge(s)),
  ),
)

const img = new ImageResponse(tree, {
  width: 1200,
  height: 630,
  fonts: [
    { name: 'Geist', data: geistRegular, style: 'normal', weight: 400 },
    { name: 'Geist', data: geistSemibold, style: 'normal', weight: 600 },
  ],
})

const buf = Buffer.from(await img.arrayBuffer())
const outDir = resolve(root, 'public')
await mkdir(outDir, { recursive: true })
await writeFile(resolve(outDir, 'og.png'), buf)
console.log(`wrote ${buf.length} bytes -> public/og.png`)
