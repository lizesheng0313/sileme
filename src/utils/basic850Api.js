import Taro from '@tarojs/taro'

const API_BASE = 'https://zjkdongao.cn/api/basic850'
const USER_ID_KEY = 'basic850_user_id'
const TOKEN_KEY = 'basic850_token'
const OPENID_KEY = 'basic850_openid'

let loginTask = null

function createId() {
  return `u_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

export function getUserId() {
  let userId = Taro.getStorageSync(OPENID_KEY) || Taro.getStorageSync(USER_ID_KEY)

  if (!userId) {
    userId = createId()
    Taro.setStorageSync(USER_ID_KEY, userId)
  }

  return userId
}

function buildUrl(path, query = {}) {
  const params = { ...query }
  const search = Object.keys(params)
    .filter(key => params[key] !== undefined && params[key] !== '')
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&')

  return `${API_BASE}${path}${search ? `?${search}` : ''}`
}

async function login() {
  const loginResult = await Taro.login()

  if (!loginResult.code) {
    throw new Error('微信登录失败')
  }

  const response = await Taro.request({
    url: `${API_BASE}/login`,
    method: 'POST',
    data: { code: loginResult.code },
    timeout: 5000
  })

  if (response.statusCode >= 400 || response.data?.code !== 0) {
    throw new Error(response.data?.message || '登录失败')
  }

  const data = response.data.data

  Taro.setStorageSync(TOKEN_KEY, data.token)
  Taro.setStorageSync(OPENID_KEY, data.openid)
  return data.token
}

export async function getToken() {
  const token = Taro.getStorageSync(TOKEN_KEY)

  if (token) return token

  if (!loginTask) {
    loginTask = login().finally(() => {
      loginTask = null
    })
  }

  return loginTask
}

async function request(path, options = {}) {
  const method = options.method || 'GET'
  const token = await getToken()
  const data = options.data || {}

  const response = await Taro.request({
    url: buildUrl(path, options.query),
    method,
    data,
    header: {
      Authorization: `Bearer ${token}`
    },
    timeout: 3000
  })

  if (response.data?.code === 401 || response.data?.code === 402) {
    Taro.removeStorageSync(TOKEN_KEY)
  }

  if (response.statusCode >= 400 || response.data?.code !== 0) {
    throw new Error(response.data?.message || 'request failed')
  }

  return response.data.data
}

export function fetchProgress() {
  return request('/progress')
}

export function syncLearned(wordId) {
  return request('/learned', {
    method: 'POST',
    data: { wordId }
  })
}

export function syncReview(wordId) {
  return request('/review', {
    method: 'POST',
    data: { wordId }
  })
}

export function fetchReviewWords() {
  return request('/review')
}

export function fetchQuiz(count = 3) {
  return request('/quiz', {
    query: { count }
  })
}

export function postQuizAnswer(payload) {
  return request('/quiz/answer', {
    method: 'POST',
    data: payload
  })
}

export function checkinToday() {
  return request('/checkin', {
    method: 'POST'
  })
}
