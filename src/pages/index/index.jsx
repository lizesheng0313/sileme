import { Component } from 'react'
import { View, Text, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import request from '../../utils/request'
import constConfig from '../../config/config'
import './index.scss'

export default class Index extends Component {
  state = {
    userInfo: null,
    todayChecked: false,
    consecutiveDays: 0,
    lastCheckinDate: null,
    loading: false,
    nickname: '',
    saveTimer: null,
    aiMessage: '每日签到，让TA知道你还活着', // AI 生成的文案
    loadingMessage: false,
    hasLoadedAI: false // 标记是否已加载过 AI 文案
  }

  componentDidMount() {
    this.initPage()
  }

  componentDidShow() {
    // 只在首次进入时初始化，避免重复调用
    if (!this.state.hasLoadedAI) {
      this.initPage()
    } else {
      // 后续进入只刷新签到状态
      this.checkTodayStatus()
      this.loadUserInfo()
    }
  }

  initPage = async () => {
    // 先加载签到状态，再加载 AI 文案
    await this.checkTodayStatus()
    await this.loadUserInfo()
    // 加载 AI 文案
    this.loadAIMessage()
  }

  componentWillUnmount() {
    if (this.state.saveTimer) {
      clearTimeout(this.state.saveTimer)
    }
  }

  loadUserInfo = async () => {
    try {
      const res = await request('/api/sileme/user/info')
      this.setState({ nickname: res.data.nickname || '' })
    } catch (err) {
      console.error(err)
    }
  }

  handleNicknameChange = (e) => {
    const nickname = e.detail.value
    this.setState({ nickname })
    
    // 清除之前的定时器
    if (this.state.saveTimer) {
      clearTimeout(this.state.saveTimer)
    }
    
    // 设置新的定时器，500ms后保存
    const timer = setTimeout(() => {
      this.saveNickname(nickname)
    }, 500)
    
    this.setState({ saveTimer: timer })
  }

  saveNickname = async (nickname) => {
    try {
      await request('/api/sileme/user/update', {
        method: 'POST',
        data: { nickname }
      })
    } catch (err) {
      console.error('保存昵称失败:', err)
    }
  }

  loadAIMessage = async () => {
    this.setState({ loadingMessage: true })
    try {
      const res = await request('/api/ai/checkinMessage', {
        method: 'POST',
        data: { consecutiveDays: this.state.consecutiveDays }
      })
      if (res && res.data && res.data.message) {
        this.setState({ 
          aiMessage: res.data.message,
          hasLoadedAI: true // 标记已加载
        })
      }
    } catch (err) {
      console.error('加载 AI 文案失败:', err)
      // 失败时使用默认文案
      const defaultMessages = [
        '铁子，还活着呢？',
        '大哥，还有气儿吗？',
        '兄弟，今天也要保住狗命啊！',
        '少加班，保住狗命！',
        '不要为了别人的PPT，可劲儿卷！',
        '命比钱重要，铁子！',
        '今天也要元气满满地摸鱼啊！',
        '打工可以，但别玩命！',
        '老板的梦想，不值得你拼命！',
        '活着比什么都重要！'
      ]
      const randomMessage = defaultMessages[Math.floor(Math.random() * defaultMessages.length)]
      this.setState({ 
        aiMessage: randomMessage,
        hasLoadedAI: true
      })
    } finally {
      this.setState({ loadingMessage: false })
    }
  }

  checkTodayStatus = async () => {
    try {
      const res = await request('/api/sileme/checkin/today')
      if (res && res.data) {
        this.setState({
          todayChecked: res.data.checked || false,
          consecutiveDays: res.data.consecutiveDays || 0,
          lastCheckinDate: res.data.lastCheckinDate
        })
      }
    } catch (err) {
      console.error(err)
      this.setState({
        todayChecked: false,
        consecutiveDays: 0
      })
    }
  }

  handleCheckin = async () => {
    if (this.state.todayChecked) {
      Taro.showToast({ title: '今天已签到', icon: 'none' })
      return
    }

    // 先请求订阅消息
    try {
      const subscribeRes = await Taro.requestSubscribeMessage({
        tmplIds: constConfig.templateMsgIds,
      })
      console.log('订阅结果:', subscribeRes)
    } catch (err) {
      console.log('订阅消息取消或失败:', err)
      // 即使订阅失败也继续签到
    }

    this.setState({ loading: true })
    try {
      const res = await request('/api/sileme/checkin/do', { method: 'POST' })
      Taro.showToast({ title: '签到成功！', icon: 'success' })
      this.setState({
        todayChecked: true,
        consecutiveDays: res.data.consecutiveDays,
        lastCheckinDate: res.data.checkinDate
      })
      // 签到成功后重新加载 AI 文案
      this.loadAIMessage()
    } catch (err) {
      Taro.showToast({ title: '签到失败', icon: 'none' })
    } finally {
      this.setState({ loading: false })
    }
  }

  goToContacts = () => {
    Taro.navigateTo({ url: '/pages/contacts/contacts' })
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
    const { todayChecked, consecutiveDays, loading, nickname, aiMessage, loadingMessage } = this.state

    return (
      <View className='index-page'>
        <View className='top-section'>
          <Input
            className='nickname-input'
            placeholder='请输入你的昵称'
            value={nickname}
            onInput={this.handleNicknameChange}
          />
          <Text className='subtitle'>
            {loadingMessage ? '加载中...' : aiMessage}
          </Text>
        </View>

        <View className='main-section'>
          <View className='status-circle' onClick={this.handleCheckin}>
            {todayChecked ? (
              <View className='checked'>
                <Text className='icon'>✓</Text>
                <Text className='text'>今日已签到</Text>
              </View>
            ) : (
              <View className='unchecked'>
                <Text className='icon'>👆</Text>
                <Text className='text'>点击签到</Text>
              </View>
            )}
          </View>

          <View className='stats'>
            <Text className='stat-value'>{consecutiveDays}</Text>
            <Text className='stat-label'>连续签到天数</Text>
          </View>
        </View>

        <View className='bottom-section'>
          <View className='contact-link' onClick={this.goToContacts}>
            <Text className='link-text'>设置紧急联系人</Text>
            <Text className='link-arrow'>→</Text>
          </View>
          <Text className='tip-text'>连续2天未签到将自动通知紧急联系人</Text>
        </View>
      </View>
    )
  }
}
