import Taro from '@tarojs/taro'
import constConfig from '../config/config'

const request = (url, options = {}) => {
  const token = Taro.getStorageSync('token')
  
  return Taro.request({
    url: constConfig.host + url,
    method: options.method || 'GET',
    data: options.data || {},
    header: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    }
  }).then(res => {
    if (res.statusCode === 200) {
      return res.data
    } else {
      Taro.showToast({
        title: res.data.message || '请求失败',
        icon: 'none'
      })
      throw new Error(res.data.message)
    }
  }).catch(err => {
    Taro.showToast({
      title: '网络错误',
      icon: 'none'
    })
    throw err
  })
}

export default request
