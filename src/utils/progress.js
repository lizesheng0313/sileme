import Taro from '@tarojs/taro'

const LEARNED_KEY = 'basic850_learned_ids'
const REVIEW_KEY = 'basic850_review_ids'

function readIds(key) {
  const stored = Taro.getStorageSync(key)

  if (!Array.isArray(stored)) {
    return []
  }

  return stored.filter(Boolean)
}

function writeIds(key, ids) {
  const nextIds = Array.from(new Set(ids))
  Taro.setStorageSync(key, nextIds)
  return nextIds
}

export function getLearnedIds() {
  return readIds(LEARNED_KEY)
}

export function getReviewIds() {
  return readIds(REVIEW_KEY)
}

export function setLearnedIds(ids) {
  return writeIds(LEARNED_KEY, ids)
}

export function setReviewIds(ids) {
  return writeIds(REVIEW_KEY, ids)
}

export function markLearned(id) {
  const learnedIds = getLearnedIds()
  const reviewIds = getReviewIds()

  setLearnedIds([...learnedIds, id])
  setReviewIds(reviewIds.filter(item => item !== id))
}

export function markReview(id) {
  const reviewIds = getReviewIds()
  setReviewIds([...reviewIds, id])
}

export function clearReview(id) {
  const reviewIds = getReviewIds()
  setReviewIds(reviewIds.filter(item => item !== id))
}
