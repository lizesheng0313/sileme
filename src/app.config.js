export default {
  pages: [
    'pages/home/index',
    'pages/learn/index',
    'pages/profile/index',
    'pages/library/index',
    'pages/word/index',
    'pages/review/index',
    'pages/quiz/index',
    'pages/source/index'
  ],
  window: {
    backgroundTextStyle: 'dark',
    navigationBarBackgroundColor: '#f6f7fb',
    navigationBarTitleText: 'Basic 850',
    navigationBarTextStyle: 'black',
    backgroundColor: '#f6f7fb'
  },
  tabBar: {
    color: '#9aa3b2',
    selectedColor: '#28674d',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页',
        iconPath: 'assets/images/index.png',
        selectedIconPath: 'assets/images/index_select.png'
      },
      {
        pagePath: 'pages/learn/index',
        text: '学习',
        iconPath: 'assets/images/records.png',
        selectedIconPath: 'assets/images/records_select.png'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
        iconPath: 'assets/images/settings.png',
        selectedIconPath: 'assets/images/settings_select.png'
      }
    ]
  }
}
