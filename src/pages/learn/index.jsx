import { useEffect, useMemo, useState } from 'react'
import { View, Text, Button, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { WORDS, CATEGORIES } from '../../data/wordBank'
import { fetchProgress, syncLearned } from '../../utils/basic850Api'
import { useBasic850Share } from '../../utils/share'
import WordStudyCard from '../../components/WordStudyCard'
import './index.scss'

function shuffleIds(ids) {
  const list = [...ids]

  for (let index = list.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    const temp = list[index]
    list[index] = list[randomIndex]
    list[randomIndex] = temp
  }

  return list
}

export default function LearnPage() {
  useBasic850Share({
    title: 'Basic 850：先学最核心的 850 个词',
    path: '/pages/learn/index'
  })

  const [mode, setMode] = useState('random')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [learnedIds, setLearnedIds] = useState([])
  const [randomOrder, setRandomOrder] = useState(() => shuffleIds(WORDS.map(item => item.id)))

  const syncProgress = async () => {
    try {
      const data = await fetchProgress()
      setLearnedIds(data.learnedIds || [])
    } catch (error) {
      setLearnedIds([])
    }
  }

  useDidShow(() => {
    syncProgress()
  })

  const remainingWords = useMemo(() => {
    const learnedSet = new Set(learnedIds)
    const notLearnedWords = WORDS.filter(item => !learnedSet.has(item.id))

    if (mode !== 'random') {
      return notLearnedWords.filter(item => item.category === mode)
    }

    const wordMap = new Map(notLearnedWords.map(item => [item.id, item]))
    const orderedWords = randomOrder.map(id => wordMap.get(id)).filter(Boolean)
    const missingWords = notLearnedWords.filter(item => !randomOrder.includes(item.id))

    return [...orderedWords, ...missingWords]
  }, [learnedIds, mode, randomOrder])

  const fallbackWords = useMemo(() => {
    if (mode === 'random') return WORDS

    const categoryList = WORDS.filter(item => item.category === mode)
    return categoryList.length ? categoryList : WORDS
  }, [mode])
  const totalWordsInMode = useMemo(() => {
    if (mode === 'random') return WORDS.length

    return WORDS.filter(item => item.category === mode).length
  }, [mode])
  const activeWords = remainingWords.length ? remainingWords : fallbackWords
  const currentWord = activeWords[currentIndex] || activeWords[0]
  const currentStep = totalWordsInMode
    ? Math.min(totalWordsInMode, totalWordsInMode - remainingWords.length + currentIndex + 1)
    : 0

  useEffect(() => {
    if (currentIndex >= activeWords.length) {
      setCurrentIndex(0)
    }
  }, [activeWords.length, currentIndex])

  const moveNext = () => {
    if (activeWords.length <= 1) return
    setCurrentIndex(index => (index + 1 >= activeWords.length ? 0 : index + 1))
  }

  const markMastered = async () => {
    if (!currentWord) return

    try {
      const data = await syncLearned(currentWord.id)
      const nextLearnedIds = data.learnedIds || []
      const learnedSet = new Set(nextLearnedIds)
      const nextRemainingWords = activeWords.filter(item => !learnedSet.has(item.id))

      setLearnedIds(data.learnedIds || [])
      setCurrentIndex(nextRemainingWords.length ? Math.min(currentIndex, nextRemainingWords.length - 1) : 0)
    } catch (error) {
      Taro.showToast({ title: '保存失败', icon: 'none' })
    }
  }

  const handleModeChange = nextMode => {
    setMode(nextMode)
    setCurrentIndex(0)

    if (nextMode === 'random') {
      setRandomOrder(shuffleIds(WORDS.map(item => item.id)))
    }
  }

  if (!currentWord) {
    return (
      <View className='page-shell learn-page'>
        <View className='empty-card'>
          <Text>这一组已经学完了。</Text>
        </View>
      </View>
    )
  }

  return (
    <View className='page-shell learn-page'>
      <View className='learn-head'>
        <View className='learn-head-side' />
        <View className='learn-step'>
          <Text className='learn-step-text'>{currentStep} / {totalWordsInMode}</Text>
          <View className='learn-step-track'>
            <View className='learn-step-fill' style={{ width: `${totalWordsInMode ? (currentStep / totalWordsInMode) * 100 : 0}%` }} />
          </View>
        </View>
        <View className='learn-head-side' />
      </View>

      <ScrollView className='learn-mode-scroll' scrollX showScrollbar={false}>
        <View className='learn-mode-row'>
          <View className={`learn-mode-chip ${mode === 'random' ? 'active' : ''}`} onClick={() => handleModeChange('random')}>
            <Text>随机</Text>
          </View>
          {CATEGORIES.map(item => (
            <View key={item.key} className={`learn-mode-chip ${mode === item.key ? 'active' : ''}`} onClick={() => handleModeChange(item.key)}>
              <Text>{item.zh}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View key={currentWord.id} className='learn-card-wrap'>
        <WordStudyCard word={currentWord} />
      </View>

      <View className='learn-actions'>
        <Button className='change-btn' onClick={moveNext}>换一个</Button>
        <Button className='know-btn' onClick={markMastered}>学会了</Button>
      </View>
    </View>
  )
}
