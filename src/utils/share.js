import { useShareAppMessage, useShareTimeline } from '@tarojs/taro'

const DEFAULT_TITLE = '把这 850 个词吃透，英文就够用'
const DEFAULT_PATH = '/pages/home/index'

function withQuery(path, query) {
  if (!query) return path
  return `${path}${path.includes('?') ? '&' : '?'}${query}`
}

export function useBasic850Share(options = {}) {
  const title = options.title || DEFAULT_TITLE
  const path = withQuery(options.path || DEFAULT_PATH, options.query)
  const query = options.query || ''
  const imageUrl = options.imageUrl

  useShareAppMessage(() => ({
    title,
    path,
    imageUrl
  }))

  useShareTimeline(() => ({
    title,
    query,
    imageUrl
  }))
}
