import { View, Text } from '@tarojs/components'
import { useBasic850Share } from '../../utils/share'
import './index.scss'

export default function SourcePage() {
  useBasic850Share({
    title: 'Basic 850 的来源：这 850 个词不是随便挑的',
    path: '/pages/source/index'
  })

  return (
    <View className='page-shell source-page'>
      <View className='hero-block source-hero'>
        <Text className='hero-eyebrow'>REFERENCE</Text>
        <Text className='hero-title'>这 850 个词不是随便挑的</Text>
      </View>

      <View className='section-card'>
        <Text className='section-title'>是谁做的</Text>
        <Text className='section-meta'>
          这套 Basic English 是英国语言学家 C. K. Ogden 做的。准确一点说，它不是一篇现代论文，而是一套从 1930 年开始发表的英语简化体系。
        </Text>
      </View>

      <View className='section-card'>
        <Text className='section-title'>核心文献</Text>
        <Text className='section-meta'>
          最核心的一本是 C. K. Ogden 在 1930 年出版的《Basic English: A General Introduction with Rules and Grammar》。
        </Text>

        <View className='source-list'>
          <View className='source-item'>
            <Text className='source-item-title'>1930</Text>
            <Text className='source-item-text'>《Basic English: A General Introduction with Rules and Grammar》</Text>
          </View>
          <View className='source-item'>
            <Text className='source-item-title'>1932</Text>
            <Text className='source-item-text'>《The Basic Words》进一步整理和解释这套核心词表。</Text>
          </View>
          <View className='source-item'>
            <Text className='source-item-title'>1934</Text>
            <Text className='source-item-text'>《The System of Basic English》把这整套方法讲得更完整。</Text>
          </View>
        </View>
      </View>

      <View className='section-card'>
        <Text className='section-title'>为什么学这 850 个词</Text>
        <Text className='section-meta'>
          因为大多数人不是输在不努力，而是输在一上来学得太多。Ogden 的想法正好相反：先抓最核心、最高频、最常用的那一层。先把这 850 个词吃透，比先背几千个只认识中文意思的词更有用。
        </Text>
      </View>

      <View className='section-card'>
        <Text className='section-title'>为什么是 850 个</Text>
        <Text className='section-meta'>
          因为在他的体系里，这 850 个词已经能搭出英语最核心的骨架。它们负责句子运转、日常表达、具体事物、性质描述和反义关系。
        </Text>

        <View className='source-list'>
          <View className='source-item'>
            <Text className='source-item-title'>100 个操作词</Text>
            <Text className='source-item-text'>让句子转起来，比如 be、have、make、go。</Text>
          </View>
          <View className='source-item'>
            <Text className='source-item-title'>400 个普通事物词</Text>
            <Text className='source-item-text'>覆盖日常最常见的一般名词和抽象名词。</Text>
          </View>
          <View className='source-item'>
            <Text className='source-item-title'>200 个可描绘事物词</Text>
            <Text className='source-item-text'>能直接画出来的具体事物，比如 door、river、fire。</Text>
          </View>
          <View className='source-item'>
            <Text className='source-item-title'>100 个性质词</Text>
            <Text className='source-item-text'>描述大小、重要性、清晰度、快慢这些性质。</Text>
          </View>
          <View className='source-item'>
            <Text className='source-item-title'>50 个反义词</Text>
            <Text className='source-item-text'>通过成对关系，用更少的词换更大的表达范围。</Text>
          </View>
        </View>
      </View>

      <View className='section-card'>
        <Text className='section-title'>学会这 850 个词能做什么</Text>
        <Text className='section-meta'>
          学会这 850 个词，你就能先把最基本的英文用起来。你可以看懂大量基础句子，能说出日常最常见的意思，也能靠这些核心词继续往上学。它们不等于全部英语，但它们是最值得先拿下的那一层。
        </Text>
      </View>

      <View className='section-card'>
        <Text className='section-title'>说得更直接一点</Text>
        <Text className='section-meta'>
          这 850 个词的价值，不是让你从此只学 850 个词，而是让你先有一套够用的核心词库。先把最常用的词学会、听熟、会用，再学别的词，速度会快很多，难度也会低很多。
        </Text>
      </View>

      <View className='section-card'>
        <Text className='section-title'>这页内容依据什么</Text>
        <Text className='section-meta'>
          这页主要依据 Ogden 在 1930 年到 1934 年之间发表的 Basic English 相关著作，以及 Britannica 对 Basic English 的条目整理。
        </Text>
      </View>
    </View>
  )
}
