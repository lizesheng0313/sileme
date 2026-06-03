import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')
const categoryDir = path.join(projectRoot, 'src/data/words/categories')
const audioRoot = path.join(projectRoot, 'audio-local')
const manifestPath = path.join(audioRoot, 'manifest.json')
const tempRoot = path.join(audioRoot, '.tmp')

const voiceMap = {
  uk: 'Daniel',
  us: 'Samantha'
}

const categoryFiles = [
  'operations.json',
  'general-things.json',
  'picturable-things.json',
  'qualities.json',
  'opposites.json'
]

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

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true })
}

async function exists(filePath) {
  try {
    const stat = await fs.stat(filePath)
    return stat.isFile() && stat.size > 0
  } catch {
    return false
  }
}

async function speakToFile(text, voice, outPath) {
  await execFileAsync('say', ['-v', voice, '-o', outPath, text])
}

async function convertAiffToM4a(inputPath, outputPath) {
  await execFileAsync('/opt/homebrew/bin/ffmpeg', [
    '-y',
    '-loglevel',
    'error',
    '-i',
    inputPath,
    '-c:a',
    'aac',
    '-b:a',
    '64k',
    outputPath
  ])
}

async function generateAudio(text, accent, outputPath) {
  const tempAiff = path.join(tempRoot, `${path.basename(outputPath, '.m4a')}.aiff`)
  await ensureDir(path.dirname(outputPath))
  await ensureDir(tempRoot)
  await speakToFile(text, voiceMap[accent], tempAiff)
  await convertAiffToM4a(tempAiff, outputPath)
  await fs.rm(tempAiff, { force: true })
}

async function main() {
  const words = await readWords()
  let completed = 0
  let generated = 0
  let skipped = 0

  const manifest = {}

  for (const word of words) {
    manifest[word.id] = {
      wordUk: `audio-local/words/${word.id}.uk.m4a`,
      wordUs: `audio-local/words/${word.id}.us.m4a`,
      exampleUk: `audio-local/examples/${word.id}.uk.m4a`,
      exampleUs: `audio-local/examples/${word.id}.us.m4a`
    }

    for (const accent of ['uk', 'us']) {
      const jobs = [
        {
          text: word.word,
          outputPath: path.join(audioRoot, 'words', `${word.id}.${accent}.m4a`)
        },
        {
          text: word.example,
          outputPath: path.join(audioRoot, 'examples', `${word.id}.${accent}.m4a`)
        }
      ]

      for (const job of jobs) {
        completed += 1

        if (await exists(job.outputPath)) {
          skipped += 1
        } else {
          await generateAudio(job.text, accent, job.outputPath)
          generated += 1
        }

        if (completed % 25 === 0 || completed === words.length * 4) {
          console.log(`progress ${completed}/${words.length * 4} generated=${generated} skipped=${skipped}`)
        }
      }
    }
  }

  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)

  console.log(JSON.stringify({
    totalWords: words.length,
    totalAudio: words.length * 4,
    generated,
    skipped,
    manifestPath
  }, null, 2))
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
