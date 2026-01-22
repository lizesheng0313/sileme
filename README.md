# 没死吧铁子 - 签到提醒小程序

一个有趣的每日签到小程序，如果连续多天未签到，会自动向紧急联系人发送邮件通知。

## 功能特性

- 📅 每日签到打卡
- 👥 设置紧急联系人
- 📧 自动邮件提醒（连续N天未签到）
- 📊 签到记录统计
- ⚙️ 个性化设置

## 技术栈

### 前端
- Taro 4.0.5
- React 18
- Sass
- Moment.js

### 后端
- Egg.js 2.x
- MySQL
- Nodemailer (邮件发送)

## 安装运行

### 前端小程序

```bash
cd sileme
pnpm install
pnpm run dev
```

### 后端API

后端代码在 `program_egg` 目录下，需要配置数据库和邮件服务。

## 邮件配置

在后端配置文件中设置邮箱信息：
- SMTP_HOST: smtp.qq.com
- SMTP_PORT: 587
- SMTP_USERNAME: 你的QQ邮箱
- SMTP_PASSWORD: QQ邮箱授权码
- SMTP_USE_TLS: true

## 项目结构

```
sileme/
├── src/
│   ├── pages/
│   │   ├── index/          # 首页签到
│   │   ├── contacts/       # 紧急联系人
│   │   ├── records/        # 签到记录
│   │   └── settings/       # 设置
│   ├── utils/
│   │   └── request.js      # 网络请求封装
│   ├── app.js
│   └── app.config.js
├── config/
└── package.json
```
