import Taro from '@tarojs/taro'
import { getToken } from './basic850Api'

const AUDIO_BASE_URL = 'https://zjkdongao.cn/api/basic850/audio'
let audioContext = null

function slug(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function getAudioUrl({ accent = 'uk', type, wordId, text }) {
  const safeWordId = slug(wordId)
  const safeText = slug(text)

  if (type === 'word') return `${AUDIO_BASE_URL}/${accent}/word/${safeWordId}`
  if (type === 'definition') return `${AUDIO_BASE_URL}/${accent}/definition/${safeWordId}`
  if (type === 'example') return `${AUDIO_BASE_URL}/${accent}/example/${safeWordId}`
  if (type === 'synonym') return `${AUDIO_BASE_URL}/${accent}/synonym/${safeWordId}/${safeText}`
  if (type === 'synUsage') return `${AUDIO_BASE_URL}/${accent}/synUsage/${safeWordId}/${safeText}`

  return ''
}

export async function playAudio(options) {
  const src = getAudioUrl(options)

  if (!src) return

  try {
    const token = await getToken()
    const result = await Taro.downloadFile({
      url: src,
      header: {
        Authorization: `Bearer ${token}`
      }
    })

    if (result.statusCode !== 200 || !result.tempFilePath) {
      throw new Error('download audio failed')
    }

    if (audioContext) {
      audioContext.stop()
      audioContext.destroy()
    }

    audioContext = Taro.createInnerAudioContext()
    audioContext.src = result.tempFilePath
    audioContext.autoplay = true
    audioContext.onError(() => {
      Taro.showToast({
        title: '音频暂时播放不了',
        icon: 'none',
        duration: 1200
      })
    })
  } catch (error) {
    Taro.showToast({
      title: '音频暂时播放不了',
      icon: 'none',
      duration: 1200
    })
  }
}

export function previewAudio(text, accent = 'uk') {
  playAudio({
    accent,
    type: 'word',
    wordId: text
  })
}
