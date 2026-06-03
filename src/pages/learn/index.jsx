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
  const activeWords = remainingWords.length ? remainingWords : fallbackWords
  const currentWord = activeWords[currentIndex] || activeWords[0]
  const totalProgress = (learnedIds.length / WORDS.length) * 100
  const categoryWords = WORDS.filter(item => item.category === currentWord?.category)
  const categoryLeftCount = categoryWords.filter(item => !learnedIds.includes(item.id)).length
  const currentStep = activeWords.length ? currentIndex + 1 : 0

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
      const nextWord = nextRemainingWords[currentIndex] || nextRemainingWords[0]

      setLearnedIds(data.learnedIds || [])
      setCurrentIndex(nextWord ? nextRemainingWords.findIndex(item => item.id === nextWord.id) : 0)
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
        <Text className='learn-back'>‹</Text>
        <View className='learn-step'>
          <Text className='learn-step-text'>{currentStep} / {activeWords.length}</Text>
          <View className='learn-step-track'>
            <View className='learn-step-fill' style={{ width: `${activeWords.length ? (currentStep / activeWords.length) * 100 : 0}%` }} />
          </View>
        </View>
        <Text className='learn-more'>•••</Text>
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

      <View className='learn-summary'>
        <Text>已学 {learnedIds.length} / {WORDS.length}</Text>
        <Text>{remainingWords.length ? `当前分类还剩 ${categoryLeftCount} 个` : '这一组已学完，当前显示复习词'}</Text>
        <Text>学会的词可在“我的-已学词”里找回。</Text>
        <View className='summary-track'>
          <View className='summary-fill' style={{ width: `${totalProgress}%` }} />
        </View>
      </View>

      <View className='learn-actions'>
        <Button className='change-btn' onClick={moveNext}>换一个</Button>
        <Button className='know-btn' onClick={markMastered}>学会了</Button>
      </View>
    </View>
  )
}
