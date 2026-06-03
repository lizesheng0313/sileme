import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')
const categoryDir = path.join(projectRoot, 'src/data/words/categories')
const audioRoot = path.join(projectRoot, 'audio')
const jobsPath = path.join(audioRoot, 'download-jobs.tsv')
const manifestPath = path.join(audioRoot, 'manifest.json')

const accentMap = {
  uk: 'en-GB',
  us: 'en-US'
}

const categoryFiles = [
  'operations.json',
  'general-things.json',
  'picturable-things.json',
  'qualities.json',
  'opposites.json'
]

function buildTtsUrl(text, accent) {
  const url = new URL('https://translate.googleapis.com/translate_tts')
  url.searchParams.set('ie', 'UTF-8')
  url.searchParams.set('q', text)
  url.searchParams.set('tl', accentMap[accent])
  url.searchParams.set('client', 'gtx')
  url.searchParams.set('sl', 'en')
  return url.toString()
}

async function readWords() {
  const groups = await Promise.all(
    categoryFiles.map(async fileName => {
      const filePath = path.join(categoryDir, fileName)
      const content = await fs.readFile(filePath, 'utf8')
      return JSON.parse(content)
    })
  )

  return groups.flat()
}

async function main() {
  const words = await readWords()
  await fs.mkdir(audioRoot, { recursive: true })

  const lines = []
  const manifest = {}

  for (const word of words) {
    manifest[word.id] = {
      wordUk: `audio/words/${word.id}.uk.mp3`,
      wordUs: `audio/words/${word.id}.us.mp3`,
      exampleUk: `audio/examples/${word.id}.uk.mp3`,
      exampleUs: `audio/examples/${word.id}.us.mp3`
    }

    for (const accent of ['uk', 'us']) {
      lines.push([
        path.join(audioRoot, 'words', `${word.id}.${accent}.mp3`),
        buildTtsUrl(word.word, accent)
      ].join('\t'))

      lines.push([
        path.join(audioRoot, 'examples', `${word.id}.${accent}.mp3`),
        buildTtsUrl(word.example, accent)
      ].join('\t'))
    }
  }

  await fs.writeFile(jobsPath, `${lines.join('\n')}\n`)
  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)

  console.log(JSON.stringify({
    totalWords: words.length,
    totalJobs: lines.length,
    jobsPath,
    manifestPath
  }, null, 2))
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
