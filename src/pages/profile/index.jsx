import { useState } from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { WORDS } from '../../data/wordBank'
import { fetchProgress } from '../../utils/basic850Api'
import { useBasic850Share } from '../../utils/share'
import './index.scss'

export default function ProfilePage() {
  useBasic850Share({
    title: 'Basic 850 英语核心词学习',
    path: '/pages/home/index'
  })

  const [progress, setProgress] = useState({
    learnedCount: 0,
    reviewCount: 0,
    leftCount: WORDS.length,
    today: null
  })

  useDidShow(async () => {
    try {
      const data = await fetchProgress()
      setProgress({
        learnedCount: data.learnedCount || 0,
        reviewCount: data.reviewCount || 0,
        leftCount: data.leftCount ?? WORDS.length,
        today: data.today || null
      })
    } catch (error) {
      setProgress({
        learnedCount: 0,
        reviewCount: 0,
        leftCount: WORDS.length,
        today: null
      })
    }
  })

  const percent = Math.round((progress.learnedCount / WORDS.length) * 100)

  return (
    <View className='page-shell profile-page'>
      <View className='profile-hero'>
        <Text className='profile-kicker'>BASIC 850</Text>
        <Text className='profile-title'>我的词库</Text>
        <View className='profile-progress'>
          <View className='profile-progress-fill' style={{ width: `${percent}%` }} />
        </View>
        <View className='profile-stats'>
          <View className='profile-stat'>
            <Text className='profile-stat-value'>{progress.learnedCount}</Text>
            <Text className='profile-stat-label'>已学</Text>
          </View>
          <View className='profile-stat'>
            <Text className='profile-stat-value'>{progress.reviewCount}</Text>
            <Text className='profile-stat-label'>复习</Text>
          </View>
          <View className='profile-stat'>
            <Text className='profile-stat-value'>{progress.leftCount}</Text>
            <Text className='profile-stat-label'>剩余</Text>
          </View>
        </View>
      </View>

      <View className='profile-grid'>
        <View className='profile-main-card learned' onClick={() => Taro.navigateTo({ url: '/pages/library/index?status=learned' })}>
          <Text className='profile-card-title'>已学词</Text>
          <Text className='profile-card-meta'>学会的词都在这</Text>
        </View>

        <View className='profile-main-card review' onClick={() => Taro.navigateTo({ url: '/pages/review/index' })}>
          <Text className='profile-card-title'>复习</Text>
          <Text className='profile-card-meta'>回看没吃透的词</Text>
        </View>

        <View className='profile-main-card quiz' onClick={() => Taro.navigateTo({ url: '/pages/quiz/index' })}>
          <Text className='profile-card-title'>考试</Text>
          <Text className='profile-card-meta'>只考学过的词</Text>
        </View>

        <View className='profile-main-card library' onClick={() => Taro.navigateTo({ url: '/pages/library/index' })}>
          <Text className='profile-card-title'>全部词库</Text>
          <Text className='profile-card-meta'>850 个词都在这</Text>
        </View>
      </View>

      <View className='profile-source' onClick={() => Taro.navigateTo({ url: '/pages/source/index' })}>
        <Text>查看文献来源</Text>
        <Text className='profile-arrow'>›</Text>
      </View>
    </View>
  )
}
