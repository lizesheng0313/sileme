import { useState } from 'react'
import { View, Text } from '@tarojs/components'
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
      <View className='review-head-card'>
        <Text className='review-title'>待复习</Text>
        <Text className='review-count'>{reviewWords.length}</Text>
      </View>

      <View className='review-list-card'>
        {reviewWords.length ? reviewWords.map(item => (
          <View
            key={item.id}
            className='review-item'
            onClick={() => Taro.navigateTo({ url: `/pages/word/index?id=${item.id}&from=review` })}
          >
            <View>
              <Text className='review-word'>{item.word}</Text>
              <Text className='review-zh'>{item.zh}</Text>
            </View>
            <Text className='review-arrow'>›</Text>
          </View>
        )) : (
          <View className='review-empty'>
            <Text className='review-empty-title'>没有待复习的词</Text>
            <Text className='review-empty-meta'>考试答错的词会自动进这里。</Text>
          </View>
        )}
      </View>
    </View>
  )
}
