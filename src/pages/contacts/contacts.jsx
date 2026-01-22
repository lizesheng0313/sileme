import { Component } from 'react'
import { View, Text, Input, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import request from '../../utils/request'
import './contacts.scss'

export default class Contacts extends Component {
  state = {
    contacts: [],
    name: '',
    email: '',
    relation: '',
    editing: false,
    editId: null
  }

  componentDidMount() {
    this.loadContacts()
  }

  componentDidShow() {
    this.loadContacts()
  }

  loadContacts = async () => {
    try {
      console.log('开始加载联系人列表...')
      const res = await request('/api/sileme/contacts/list')
      console.log('联系人列表返回:', res)
      this.setState({ contacts: res.data })
    } catch (err) {
      console.error('加载联系人失败:', err)
    }
  }

  handleInputChange = (field, e) => {
    this.setState({ [field]: e.detail.value })
  }

  handleSave = async () => {
    const { name, email, relation, editing, editId } = this.state
    
    if (!name || !email) {
      Taro.showToast({ title: '请填写完整信息', icon: 'none' })
      return
    }

    try {
      if (editing) {
        console.log('更新联系人:', editId)
        await request(`/api/sileme/contacts/${editId}`, {
          method: 'PUT',
          data: { name, email, relation }
        })
        Taro.showToast({ title: '更新成功', icon: 'success' })
      } else {
        console.log('添加联系人:', { name, email, relation })
        const res = await request('/api/sileme/contacts/add', {
          method: 'POST',
          data: { name, email, relation }
        })
        console.log('添加联系人返回:', res)
        Taro.showToast({ title: '添加成功', icon: 'success' })
      }
      
      this.setState({ name: '', email: '', relation: '', editing: false, editId: null })
      console.log('准备刷新列表...')
      await this.loadContacts()
    } catch (err) {
      console.error('保存联系人失败:', err)
      Taro.showToast({ title: '操作失败', icon: 'none' })
    }
  }

  handleEdit = (contact) => {
    this.setState({
      name: contact.name,
      email: contact.email,
      relation: contact.relation,
      editing: true,
      editId: contact.id
    })
  }

  handleDelete = async (id) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这个联系人吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await request(`/api/sileme/contacts/${id}`, { method: 'DELETE' })
            Taro.showToast({ title: '删除成功', icon: 'success' })
            this.loadContacts()
          } catch (err) {
            Taro.showToast({ title: '删除失败', icon: 'none' })
          }
        }
      }
    })
  }

  onShareAppMessage() {
    return {
      title: '没死吧铁子 - 设置紧急联系人，让关心你的人更安心',
      path: '/pages/index/index'
    }
  }

  onShareTimeline() {
    return {
      title: '没死吧铁子 - 设置紧急联系人，让关心你的人更安心'
    }
  }

  render() {
    const { contacts, name, email, relation, editing } = this.state

    return (
      <View className='contacts-page'>
        <View className='form-card'>
          <Text className='form-title'>{editing ? '编辑' : '添加'}紧急联系人</Text>
          
          <View className='form-item'>
            <Text className='label'>姓名</Text>
            <Input
              className='input'
              placeholder='请输入姓名'
              value={name}
              onInput={this.handleInputChange.bind(this, 'name')}
            />
          </View>

          <View className='form-item'>
            <Text className='label'>邮箱</Text>
            <Input
              className='input'
              placeholder='请输入邮箱'
              value={email}
              onInput={this.handleInputChange.bind(this, 'email')}
            />
          </View>

          <View className='form-item'>
            <Text className='label'>关系</Text>
            <Input
              className='input'
              placeholder='如：家人、朋友'
              value={relation}
              onInput={this.handleInputChange.bind(this, 'relation')}
            />
          </View>

          <Button className='save-btn' onClick={this.handleSave}>
            {editing ? '更新' : '保存'}
          </Button>
        </View>

        <View className='contacts-list'>
          <Text className='list-title'>联系人列表</Text>
          {contacts.map(contact => (
            <View key={contact.id} className='contact-item'>
              <View className='contact-info'>
                <Text className='contact-name'>{contact.name}</Text>
                <Text className='contact-email'>{contact.email}</Text>
                {contact.relation && (
                  <Text className='contact-relation'>{contact.relation}</Text>
                )}
              </View>
              <View className='contact-actions'>
                <Button
                  className='edit-btn'
                  size='mini'
                  onClick={() => this.handleEdit(contact)}
                >
                  编辑
                </Button>
                <Button
                  className='delete-btn'
                  size='mini'
                  onClick={() => this.handleDelete(contact.id)}
                >
                  删除
                </Button>
              </View>
            </View>
          ))}
          
          {contacts.length === 0 && (
            <View className='empty'>
              <Text>暂无联系人</Text>
            </View>
          )}
        </View>
      </View>
    )
  }
}
