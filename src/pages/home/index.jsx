import { useState } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { WORDS } from '../../data/wordBank'
import { fetchProgress } from '../../utils/basic850Api'
import { useBasic850Share } from '../../utils/share'
import './index.scss'

export default function HomePage() {
  useBasic850Share()

  const [learnedCount, setLearnedCount] = useState(0)
  const [reviewCount, setReviewCount] = useState(0)
  const [today, setToday] = useState(null)
  const leftCount = WORDS.length - learnedCount
  const progress = Math.round((learnedCount / WORDS.length) * 100)

  const applyProgress = data => {
    setLearnedCount(data.learnedCount || 0)
    setReviewCount(data.reviewCount || 0)
    setToday(data.today || null)
  }

  const syncProgress = async () => {
    try {
      applyProgress(await fetchProgress())
    } catch (error) {
      Taro.showToast({ title: '进度同步失败', icon: 'none' })
    }
  }

  useDidShow(() => {
    syncProgress()
  })

  const goLibrary = () => Taro.navigateTo({ url: '/pages/library/index' })
  const goLearned = () => Taro.navigateTo({ url: '/pages/library/index?status=learned' })
  const goLearn = () => Taro.switchTab({ url: '/pages/learn/index' })
  const goSource = () => Taro.navigateTo({ url: '/pages/source/index' })
  return (
    <View className='page-shell home-page'>
      <View className='home-head'>
        <View>
          <Text className='home-brand'>英文</Text>
          <Text className='home-brand strong'>只学 850 个词</Text>
          <Text className='home-number'>就够了</Text>
        </View>
        <View className='home-icons'>
          <Text className='home-icon'>⌕</Text>
          <Text className='home-icon'>⌾</Text>
        </View>
      </View>

      <View className='plan-card'>
        <View className='plan-copy'>
          <Text className='plan-label'>今日进度</Text>
          <Text className='plan-main'>{learnedCount} / {WORDS.length}</Text>
          <Text className='plan-unit'>已学会</Text>
          <View className='plan-progress'>
            <View className='plan-progress-fill' style={{ width: `${progress}%` }} />
          </View>
          <Text className='plan-desc'>今日学会 {today?.learnedCount || 0} 个 · 连续 {today?.streak || 0} 天</Text>
        </View>

        <View className='balloon-scene'>
          <View className='balloon' />
          <View className='cloud cloud-one' />
          <View className='cloud cloud-two' />
        </View>

        <View className='plan-stats'>
          <View className='plan-stat' onClick={goLearned}>
            <Text className='plan-stat-label'>已学</Text>
            <Text className='plan-stat-value'>{learnedCount}</Text>
          </View>
          <View className='plan-divider' />
          <View className='plan-stat' onClick={goLearn}>
            <Text className='plan-stat-label'>剩余</Text>
            <Text className='plan-stat-value'>{leftCount}</Text>
          </View>
        </View>

        <Button className='home-start-btn' onClick={goLearn}>
          <Text>开始学习</Text>
          <Text className='start-dot'>›</Text>
        </Button>
      </View>

      <View className='library-card' onClick={goLibrary}>
        <View className='book-cover'>
          <Text>Basic</Text>
          <Text>850</Text>
        </View>
        <View className='library-copy'>
          <Text className='library-title'>全部 850 词</Text>
          <Text className='library-sub'>查看完整词库和分类</Text>
          <View className='library-progress'>
            <View className='library-progress-fill' style={{ width: `${progress}%` }} />
          </View>
          <Text className='library-meta'>已学 {learnedCount} / 850</Text>
        </View>
        <Text className='library-percent'>{progress}%</Text>
      </View>

      <View className='quick-row'>
        <View className='quick-card' onClick={() => Taro.navigateTo({ url: '/pages/review/index' })}>
          <Text className='quick-badge'>{reviewCount}</Text>
          <Text className='quick-icon'>↻</Text>
          <Text className='quick-title'>复习</Text>
        </View>
        <View className='quick-card' onClick={() => Taro.navigateTo({ url: '/pages/quiz/index' })}>
          <Text className='quick-icon'>★</Text>
          <Text className='quick-title'>考试</Text>
        </View>
        <View className='quick-card' onClick={goSource}>
          <Text className='quick-icon'>□</Text>
          <Text className='quick-title'>文献</Text>
        </View>
      </View>
    </View>
  )
}
