import { useState } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro, { useDidShow, useRouter } from '@tarojs/taro'
import { getCategory, getWordById } from '../../data/wordBank'
import { fetchProgress, syncLearned } from '../../utils/basic850Api'
import { useBasic850Share } from '../../utils/share'
import WordStudyCard from '../../components/WordStudyCard'
import './index.scss'

export default function WordPage() {
  const router = useRouter()
  const word = getWordById(router.params.id)
  const shareQuery = word ? `id=${encodeURIComponent(word.id)}` : ''
  const [isLearned, setIsLearned] = useState(false)

  useBasic850Share({
    title: word ? `${word.word}：Basic 850 核心词` : 'Basic 850 核心词卡',
    path: '/pages/word/index',
    query: shareQuery
  })

  useDidShow(async () => {
    if (!word) return

    try {
      const data = await fetchProgress()
      setIsLearned((data.learnedIds || []).includes(word.id))
    } catch (error) {
      setIsLearned(false)
    }
  })

  if (!word) {
    return (
      <View className='page-shell word-page'>
        <View className='section-card empty-state'>这个词卡还没找到。</View>
      </View>
    )
  }

  const category = getCategory(word.category)

  const addLearned = async () => {
    try {
      await syncLearned(word.id)
      setIsLearned(true)
      Taro.showToast({ title: '已加入学习', icon: 'none' })
    } catch (error) {
      Taro.showToast({ title: '保存失败', icon: 'none' })
    }
  }

  return (
    <View className='page-shell word-page'>
      <WordStudyCard
        word={word}
        categoryText='label'
        footer={(
          <>
            <View className='detail-meta'>
              <Text className='detail-meta-label'>所属分类</Text>
              <Text className='detail-meta-value'>{category?.zh} · {category?.total} words</Text>
            </View>

            {!isLearned ? (
              <View className='inline-actions'>
                <Button className='secondary-btn' onClick={addLearned}>加入已学习</Button>
              </View>
            ) : null}
          </>
        )}
      />
    </View>
  )
}
