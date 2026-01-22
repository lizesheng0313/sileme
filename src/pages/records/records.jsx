import { Component } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import moment from 'moment'
import request from '../../utils/request'
import './records.scss'

export default class Records extends Component {
  state = {
    records: [],
    stats: {
      totalDays: 0,
      maxConsecutive: 0,
      currentConsecutive: 0
    }
  }

  componentDidMount() {
    this.loadRecords()
    this.loadStats()
  }

  componentDidShow() {
    this.loadRecords()
    this.loadStats()
  }

  loadRecords = async () => {
    try {
      const res = await request('/api/sileme/checkin/records')
      this.setState({ records: res.data })
    } catch (err) {
      console.error(err)
    }
  }

  loadStats = async () => {
    try {
      const res = await request('/api/sileme/checkin/stats')
      this.setState({ stats: res.data })
    } catch (err) {
      console.error(err)
    }
  }

  onShareAppMessage() {
    const { stats } = this.state
    return {
      title: `我已经连续签到${stats.currentConsecutive}天了！一起来打卡吧`,
      path: '/pages/index/index'
    }
  }

  onShareTimeline() {
    const { stats } = this.state
    return {
      title: `我已经连续签到${stats.currentConsecutive}天了！一起来打卡吧`
    }
  }

  render() {
    const { records, stats } = this.state

    return (
      <View className='records-page'>
        <View className='stats-card'>
          <View className='stat-item'>
            <Text className='stat-value'>{stats.totalDays}</Text>
            <Text className='stat-label'>累计签到</Text>
          </View>
          <View className='stat-item'>
            <Text className='stat-value'>{stats.maxConsecutive}</Text>
            <Text className='stat-label'>最长连续</Text>
          </View>
          <View className='stat-item'>
            <Text className='stat-value'>{stats.currentConsecutive}</Text>
            <Text className='stat-label'>当前连续</Text>
          </View>
        </View>

        <View className='records-list'>
          <Text className='list-title'>签到记录</Text>
          {records.map(record => (
            <View key={record.id} className='record-item'>
              <View className='record-date'>
                <Text className='date'>{moment(record.checkinDate).format('MM-DD')}</Text>
                <Text className='weekday'>{moment(record.checkinDate).format('dddd')}</Text>
              </View>
              <View className='record-time'>
                <Text>{moment(record.checkinTime).format('HH:mm')}</Text>
              </View>
            </View>
          ))}
          
          {records.length === 0 && (
            <View className='empty'>
              <Text>暂无签到记录</Text>
            </View>
          )}
        </View>
      </View>
    )
  }
}
