export default {
  pages: [
    'pages/index/index',
    'pages/contacts/contacts',
    'pages/records/records',
    'pages/settings/settings'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '没死吧铁子',
    navigationBarTextStyle: 'black',
    backgroundColor: '#fef9f3'
  },
  tabBar: {
    color: '#6c757d',
    selectedColor: '#ff6b6b',
    backgroundColor: '#fff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        iconPath: './assets/images/index.png',
        selectedIconPath: './assets/images/index_select.png'
      },
      {
        pagePath: 'pages/records/records',
        text: '记录',
        iconPath: './assets/images/records.png',
        selectedIconPath: './assets/images/records_select.png'
      },
      {
        pagePath: 'pages/settings/settings',
        text: '设置',
        iconPath: './assets/images/settings.png',
        selectedIconPath: './assets/images/settings_select.png'
      }
    ]
  }
}
