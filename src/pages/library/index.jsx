import { useState } from 'react'
import { View, Text, Input } from '@tarojs/components'
import Taro, { useDidShow, useLoad, useRouter } from '@tarojs/taro'
import { CATEGORIES, WORDS, getCategory } from '../../data/wordBank'
import { fetchProgress } from '../../utils/basic850Api'
import { previewAudio } from '../../utils/mockAudio'
import { useBasic850Share } from '../../utils/share'
import './index.scss'

export default function LibraryPage() {
  useBasic850Share({
    title: 'Basic 850 完整词库',
    path: '/pages/library/index'
  })

  const router = useRouter()
  const [keyword, setKeyword] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [status, setStatus] = useState('all')
  const [learnedIds, setLearnedIds] = useState([])

  useLoad(() => {
    if (router.params.category) {
      setActiveCategory(router.params.category)
    }

    if (router.params.status) {
      setStatus(router.params.status)
    }
  })

  useDidShow(async () => {
    try {
      const data = await fetchProgress()
      setLearnedIds(data.learnedIds || [])
    } catch (error) {
      setLearnedIds([])
    }
  })

  const learnedSet = new Set(learnedIds)
  const filteredWords = WORDS.filter(item => {
    const matchCategory = activeCategory === 'all' || item.category === activeCategory
    const matchStatus = status !== 'learned' || learnedSet.has(item.id)
    const search = keyword.trim().toLowerCase()
    const matchKeyword = !search
      || item.word.toLowerCase().includes(search)
      || item.zh.includes(search)
      || item.definition.toLowerCase().includes(search)
    return matchCategory && matchStatus && matchKeyword
  })

  return (
    <View className='page-shell library-page'>
      <View className='section-card library-head'>
        <Text className='section-title'>{status === 'learned' ? '已学词' : '全部词库'}</Text>
        <Text className='section-meta'>当前显示 {filteredWords.length} / {WORDS.length}</Text>

        <View className='search-shell'>
          <Input
            className='search-input'
            placeholder='搜索单词、中文或定义'
            value={keyword}
            onInput={e => setKeyword(e.detail.value)}
          />
        </View>

        <View className='library-status-row'>
          <Text className={`status-chip ${status === 'all' ? 'active' : ''}`} onClick={() => setStatus('all')}>全部 850 词</Text>
          <Text className={`status-chip ${status === 'learned' ? 'active' : ''}`} onClick={() => setStatus('learned')}>已学词</Text>
        </View>

        <View className='chip-row category-row'>
          <Text className={`chip ${activeCategory === 'all' ? 'active' : ''}`} onClick={() => setActiveCategory('all')}>全部</Text>
          {CATEGORIES.map(item => (
            <Text
              key={item.key}
              className={`chip ${activeCategory === item.key ? 'active' : ''}`}
              onClick={() => setActiveCategory(item.key)}
            >
              {item.zh}
            </Text>
          ))}
        </View>
      </View>

      <View className='library-grid'>
        {filteredWords.map(item => (
          <View
            key={item.id}
            className='library-item'
            onClick={() => Taro.navigateTo({ url: `/pages/word/index?id=${item.id}` })}
          >
            <View className='word-topline'>
              <Text className={`word-chip ${item.category}`}>{getCategory(item.category)?.zh}</Text>
              {learnedSet.has(item.id) ? <Text className='learned-mark'>已学</Text> : null}
              <Text className='mini-ipa'>{item.ipaUk}</Text>
            </View>
            <Text className='library-word'>{item.word}</Text>
            <Text className='library-zh'>{item.zh}</Text>
            <Text className='library-def'>{item.definition}</Text>
            <View className='library-foot'>
              <Text className='library-link'>查看词卡</Text>
              <Text className='library-audio' onClick={e => {
                e.stopPropagation()
                previewAudio(item.word, 'uk')
              }}>发音</Text>
            </View>
          </View>
        ))}
      </View>

      {filteredWords.length === 0 && (
        <View className='section-card empty-state'>没有匹配到词，换个关键词试试。</View>
      )}
    </View>
  )
}
