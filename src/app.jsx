import { Component } from 'react'
import Taro from '@tarojs/taro'
import constConfig from './config/config'
import './app.scss'

class App extends Component {
  async componentDidMount() {
    // 自动登录
    await this.autoLogin()
    
    // 登录完成后，通知页面可以加载数据了
    Taro.eventCenter.trigger('loginComplete')
  }

  autoLogin = async () => {
    try {
      console.log('开始自动登录...')
      
      // 调用微信登录
      const loginRes = await Taro.login()
      console.log('wx.login成功，code:', loginRes.code)

      // 用code换取token
      const res = await Taro.request({
        url: constConfig.host + '/api/sileme/login',
        method: 'POST',
        header: {
          'Content-Type': 'application/json'
        },
        data: {
          code: loginRes.code
        }
      })

      console.log('登录接口返回:', res)

      if (res.statusCode === 200 && res.data.code === 0) {
        // 保存token
        Taro.setStorageSync('token', res.data.data.token)
        console.log('自动登录成功，token已保存')
      } else {
        console.error('登录失败:', res.data)
        Taro.showToast({
          title: res.data?.message || '登录失败',
          icon: 'none',
          duration: 2000
        })
      }
    } catch (err) {
      console.error('自动登录异常:', err)
      Taro.showToast({
        title: '登录异常，请重启小程序',
        icon: 'none',
        duration: 2000
      })
    }
  }

  componentDidShow() {}

  componentDidHide() {}

  render() {
    return this.props.children
  }
}

export default App
