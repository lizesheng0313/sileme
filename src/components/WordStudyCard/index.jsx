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
  }

  const playPron = (event, nextAccent) => {
    event?.stopPropagation?.()
    setAccent(nextAccent)
    play('word', undefined, nextAccent)
  }

  return (
    <View className='word-study-card'>
      <View className='word-accent-bar'>
        <Text className='word-accent-title'>发音口音</Text>
        <View className='word-accent-switch'>
          <View className={`word-accent-option ${accent === 'uk' ? 'active' : ''}`} onClick={() => selectAccent('uk')}>
            <Text>UK 英式</Text>
          </View>
          <View className={`word-accent-option ${accent === 'us' ? 'active' : ''}`} onClick={() => selectAccent('us')}>
            <Text>US 美式</Text>
          </View>
        </View>
      </View>

      <View className='word-hero-card'>
        <Text className='word-category'>{category?.[categoryText] || category?.zh}</Text>
        <Text className='word-hero-main'>{word.word}</Text>

        <View className='word-pron-current'>
          <Text className={`word-pron-tag ${accent}`}>{accent === 'uk' ? '英' : '美'}</Text>
          <Text className='word-pron-text'>{accent === 'uk' ? word.ipaUk : word.ipaUs}</Text>
          <Button className={`word-sound-btn ${accent}`} onClick={event => playPron(event, accent)}><SoundIcon /></Button>
        </View>
      </View>

      <View className='word-info-card'>
        <View className='word-title-row'>
          <Text className='word-info-label'>释义</Text>
          <Button className={`word-mini-listen ${accent}`} onClick={() => play('definition')}><SoundIcon /></Button>
        </View>
        <Text className='word-meaning-en'>{word.definition}</Text>
        <Text className='word-meaning-zh'>{word.zh}</Text>
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
              <View key={item} className='word-syn-chip'>
                <Text>{item}</Text>
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
            const summary = [detail.def, detail.vs].filter(Boolean).join(' · ')

            return (
              <View key={item} className='word-detail-row'>
                <View className='word-detail-copy'>
                  <Text className='word-detail-word'>{item}</Text>
                  {summary ? <Text className='word-detail-summary'>{summary}</Text> : null}
                  {detail.example ? <Text className='word-detail-example'>{detail.example}</Text> : null}
                  {detail.exampleZh ? <Text className='word-detail-translation'>{detail.exampleZh}</Text> : null}
                </View>
                <Button className={`word-row-listen ${accent}`} onClick={() => play('synExample', item)}><SoundIcon /></Button>
              </View>
            )
          })}
        </View>
      ) : null}

      {footer}
    </View>
  )
}
