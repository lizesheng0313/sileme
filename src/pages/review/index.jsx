import { useState } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { fetchReviewWords } from '../../utils/basic850Api'
import { useBasic850Share } from '../../utils/share'
import './index.scss'

export default function ReviewPage() {
  useBasic850Share({
    title: 'Basic 850：复习最核心的英语词',
    path: '/pages/review/index'
  })

  const [reviewWords, setReviewWords] = useState([])

  useDidShow(() => {
    fetchReviewWords()
      .then(words => setReviewWords(words || []))
      .catch(() => setReviewWords([]))
  })

  return (
    <View className='page-shell review-page'>
      <View className='section-card review-intro'>
        <Text className='section-title'>复习</Text>
        <Text className='section-meta'>小测答错的词会自动进这里。复习时点词卡重新看释义、例句和近义词区别。</Text>
      </View>

      <View className='section-card'>
        <Text className='section-title'>待复习</Text>
        <Text className='section-meta'>当前有 {reviewWords.length} 个词需要回看。</Text>

        {reviewWords.length ? reviewWords.map(item => (
          <View
            key={item.id}
            className='review-item'
            onClick={() => Taro.navigateTo({ url: `/pages/word/index?id=${item.id}` })}
          >
            <View>
              <Text className='review-word'>{item.word}</Text>
              <Text className='review-zh'>{item.zh}</Text>
            </View>
            <Text className='review-tag'>去复习</Text>
          </View>
        )) : <Text className='section-meta'>现在还没有待复习的词。去做一次小测，答错的词会自动放进来。</Text>}
      </View>

      <View className='inline-actions review-actions'>
        <Button className='secondary-btn' onClick={() => Taro.navigateTo({ url: '/pages/quiz/index' })}>复习后做小测</Button>
        <Button className='ghost-btn' onClick={() => Taro.switchTab({ url: '/pages/learn/index' })}>回学习页</Button>
      </View>
    </View>
  )
}
