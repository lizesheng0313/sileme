import { useEffect, useState } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { fetchQuiz, postQuizAnswer } from '../../utils/basic850Api'
import { useBasic850Share } from '../../utils/share'
import './index.scss'

export default function QuizPage() {
  useBasic850Share({
    title: 'Basic 850：测测你掌握了多少',
    path: '/pages/quiz/index'
  })

  const [selected, setSelected] = useState('')
  const [answered, setAnswered] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [finished, setFinished] = useState(false)
  const current = questions[currentIndex]

  useEffect(() => {
    fetchQuiz(10)
      .then(data => setQuestions(data || []))
      .catch(() => Taro.showToast({ title: '题目加载失败', icon: 'none' }))
  }, [])

  const submitAnswer = async () => {
    if (!current || !selected || submitting) return

    const isCorrect = selected === current.answer
    setSubmitting(true)

    try {
      await postQuizAnswer({
        wordId: current.id,
        selected,
        answer: current.answer
      })
    } catch (error) {
      Taro.showToast({ title: '答题记录保存失败', icon: 'none' })
    } finally {
      setSubmitting(false)
    }

    setAnswered(true)
    setResult(isCorrect ? 'correct' : 'wrong')

    if (isCorrect) {
      setCorrectCount(count => count + 1)
    }
  }

  const nextQuestion = () => {
    if (!answered) {
      submitAnswer()
      return
    }

    if (currentIndex + 1 >= questions.length) {
      setFinished(true)
      return
    }

    setSelected('')
    setAnswered(false)
    setSubmitting(false)
    setResult(null)
    setCurrentIndex(index => index + 1)
  }

  const skipQuestion = () => {
    if (currentIndex + 1 >= questions.length) {
      setFinished(true)
      return
    }

    setSelected('')
    setAnswered(false)
    setSubmitting(false)
    setResult(null)
    setCurrentIndex(index => index + 1)
  }

  const restartQuiz = () => {
    setSelected('')
    setAnswered(false)
    setSubmitting(false)
    setResult(null)
    setCorrectCount(0)
    setCurrentIndex(0)
    setFinished(false)

    fetchQuiz(10)
      .then(data => setQuestions(data || []))
      .catch(() => Taro.showToast({ title: '题目加载失败', icon: 'none' }))
  }

  if (finished) {
    return (
      <View className='page-shell quiz-page'>
        <View className='section-card quiz-finish'>
          <Text className='section-title'>小测完成</Text>
          <Text className='quiz-score'>{correctCount} / {questions.length}</Text>
          <Text className='section-meta'>答错的词已经自动放进复习，回去看一遍会更稳。</Text>
          <View className='inline-actions quiz-actions'>
            <Button className='secondary-btn' onClick={restartQuiz}>再来一组</Button>
            <Button className='ghost-btn' onClick={() => Taro.navigateTo({ url: '/pages/review/index' })}>去复习</Button>
          </View>
        </View>
      </View>
    )
  }

  if (!current) {
    return (
      <View className='page-shell quiz-page'>
        <View className='section-card quiz-intro'>
          <Text className='section-title'>小测验</Text>
          <Text className='section-meta'>先至少学会 4 个词，再来考试。考试只会从已学词里随机抽题。</Text>
          <View className='inline-actions quiz-actions'>
            <Button className='secondary-btn' onClick={() => Taro.switchTab({ url: '/pages/learn/index' })}>去学习</Button>
          </View>
        </View>
      </View>
    )
  }

  return (
    <View className='page-shell quiz-page'>
      <View className='section-card quiz-intro'>
        <Text className='section-title'>小测验</Text>
        <Text className='section-meta'>只从已学词里随机抽题，最多 10 题。答错会自动进入复习。</Text>
      </View>

      <View className='section-card'>
        <Text className='quiz-label'>第 {currentIndex + 1} / {questions.length} 题</Text>
        <Text className='quiz-question'>{current.question}</Text>

        <View className='quiz-options'>
          {current.options.map(item => (
            <View
              key={item}
              className={`quiz-option ${selected === item ? 'selected' : ''} ${answered && item === current.answer ? 'correct' : ''} ${answered && selected === item && item !== current.answer ? 'wrong' : ''}`}
              onClick={() => {
                if (!answered) setSelected(item)
              }}
            >
              <Text className='quiz-option-text'>{item}</Text>
            </View>
          ))}
        </View>

        {answered ? (
          <View className={`quiz-result ${result}`}>
            <Text className='quiz-result-title'>{result === 'correct' ? '答对了' : '答错了'}</Text>
            <Text className='quiz-result-meta'>
              正确答案：{current.answer}{result === 'wrong' ? '，这个词已放进复习。' : ''}
            </Text>
          </View>
        ) : null}

        <View className='inline-actions quiz-actions'>
          <Button className='ghost-btn' onClick={skipQuestion}>跳过这题</Button>
          <Button className='secondary-btn' onClick={nextQuestion}>{submitting ? '提交中' : answered && currentIndex + 1 >= questions.length ? '完成小测' : answered ? '下一题' : '提交答案'}</Button>
        </View>
      </View>
    </View>
  )
}
