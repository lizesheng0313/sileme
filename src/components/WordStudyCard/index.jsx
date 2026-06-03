import { useState } from 'react'
import { View, Text, Button } from '@tarojs/components'
import { getCategory } from '../../data/wordBank'
import { playAudio } from '../../utils/mockAudio'
import './index.scss'

function SoundIcon() {
  return <Text className='iconfont icon-shengyin sound-icon' />
}

export default function WordStudyCard({ word, categoryText = 'zh', footer = null }) {
  const [accent, setAccent] = useState('us')
  const category = getCategory(word.category)

  const play = (type, text, nextAccent = accent) => {
    playAudio({
      accent: nextAccent,
      type,
      wordId: word.id,
      text
    })
  }

  const selectAccent = nextAccent => {
    setAccent(nextAccent)
    play('word', undefined, nextAccent)
  }

  const playPron = (event, nextAccent) => {
    event?.stopPropagation?.()
    selectAccent(nextAccent)
  }

  return (
    <View className='word-study-card'>
      <View className='word-hero-card'>
        <Text className='word-category'>{category?.[categoryText] || category?.zh}</Text>
        <Text className='word-hero-main'>{word.word}</Text>

        <View className='word-pron-row'>
          <View className={`word-pron-item ${accent === 'us' ? 'active' : ''}`} onClick={() => selectAccent('us')}>
            <Text className='word-pron-tag us'>美</Text>
            <Text className='word-pron-text'>{word.ipaUs}</Text>
            <Button className='word-sound-btn' onClick={event => playPron(event, 'us')}><SoundIcon /></Button>
          </View>
          <View className={`word-pron-item ${accent === 'uk' ? 'active' : ''}`} onClick={() => selectAccent('uk')}>
            <Text className='word-pron-tag uk'>英</Text>
            <Text className='word-pron-text'>{word.ipaUk}</Text>
            <Button className='word-sound-btn' onClick={event => playPron(event, 'uk')}><SoundIcon /></Button>
          </View>
        </View>
      </View>

      <View className='word-info-card'>
        <View className='word-title-row'>
          <Text className='word-info-label'>意思</Text>
          <Button className='word-mini-listen' onClick={() => play('definition')}><SoundIcon /></Button>
        </View>
        <Text className='word-meaning-en'>{word.definition}</Text>
        <Text className='word-meaning-zh'>{word.zh}</Text>
      </View>

      <View className='word-info-card'>
        <View className='word-title-row'>
          <Text className='word-info-label'>例句</Text>
          <Button className='word-mini-listen' onClick={() => play('example')}><SoundIcon /></Button>
        </View>
        <Text className='word-example-en'>{word.example}</Text>
        {word.exampleZh ? <Text className='word-example-zh'>{word.exampleZh}</Text> : null}
      </View>

      {word.core ? (
        <View className='word-info-card compact'>
          <Text className='word-info-label'>核心意象</Text>
          <Text className='word-core-text'>{word.core}</Text>
        </View>
      ) : null}

      {word.synonyms?.length ? (
        <View className='word-info-card'>
          <Text className='word-info-label'>近义词</Text>
          <View className='word-syn-row'>
            {word.synonyms.map(item => (
              <View key={item} className='word-syn-chip' onClick={() => play('synonym', item)}>
                <Text>{item}</Text>
                <SoundIcon />
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {word.synonyms?.length ? (
        <View className='word-detail-card'>
          <Text className='word-info-label'>近义词区别</Text>
          {word.synonyms.map(item => {
            const detail = word.synDetail?.[item]
            if (!detail) return null

            return (
              <View key={item} className='word-detail-row'>
                <View className='word-detail-copy'>
                  <Text className='word-detail-word'>{item}</Text>
                  <Text className='word-detail-line'>释义：{detail.def}</Text>
                  <Text className='word-detail-line strong'>区别：{detail.vs}</Text>
                  <Text className='word-detail-line'>场景：{detail.use}</Text>
                </View>
                <Button className='word-row-listen' onClick={() => play('synUsage', item)}><SoundIcon /></Button>
              </View>
            )
          })}
        </View>
      ) : null}

      {footer}
    </View>
  )
}
