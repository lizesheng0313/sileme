import { Component } from 'react'
import { View, Text, Switch, Input, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import request from '../../utils/request'
import './settings.scss'

export default class Settings extends Component {
  state = {}

  handleNavigateToMiniProgram = () => {
    Taro.navigateToMiniProgram({
      appId: 'wxf9b3e05e674469ac',
      path: 'pages/index/index',
      success: () => {
        console.log('跳转成功')
      },
      fail: (err) => {
        console.error('跳转失败:', err)
        Taro.showToast({
          title: '跳转失败',
          icon: 'none'
        })
      }
    })
  }

  onShareAppMessage() {
    return {
      title: '没死吧铁子 - 每日签到，让TA知道你还活着',
      path: '/pages/index/index'
    }
  }

  onShareTimeline() {
    return {
      title: '没死吧铁子 - 每日签到，让TA知道你还活着'
    }
  }

  render() {
    return (
      <View className='settings-page'>
        <View className='settings-list'>
          <View className='list-item' onClick={this.handleNavigateToMiniProgram}>
            <Text className='item-label'>更多好玩</Text>
            <Text className='item-arrow'>→</Text>
          </View>
        </View>

        <View className='info-card'>
          <Text className='info-title'>关于</Text>
          <Text className='info-text'>没死吧铁子 v1.0.0</Text>
          <Text className='info-text'>每日签到，让TA知道你还活着</Text>
        </View>
      </View>
    )
  }
}
