import operationWords from './words/categories/operations.json'
import generalThingWords from './words/categories/general-things.json'
import picturableThingWords from './words/categories/picturable-things.json'
import qualityWords from './words/categories/qualities.json'
import oppositeWords from './words/categories/opposites.json'

export const CATEGORIES = [
  { key: 'op', label: 'Operations', zh: '操作词', color: '#b36a1d', total: 100 },
  { key: 'gt', label: 'General Things', zh: '通用事物', color: '#29614f', total: 400 },
  { key: 'pt', label: 'Picturable Things', zh: '可画事物', color: '#b8892b', total: 200 },
  { key: 'qg', label: 'Qualities', zh: '性质词', color: '#4d6e8f', total: 100 },
  { key: 'qo', label: 'Opposites', zh: '反义词', color: '#7d4c66', total: 50 }
]

export const WORDS = [
  ...operationWords,
  ...generalThingWords,
  ...picturableThingWords,
  ...qualityWords,
  ...oppositeWords
]

if (WORDS.length !== 850) {
  throw new Error(`Basic 850 count mismatch: ${WORDS.length}`)
}

export function getCategory(key) {
  return CATEGORIES.find(item => item.key === key)
}

export function getWordById(id) {
  return WORDS.find(item => item.id === id)
}
