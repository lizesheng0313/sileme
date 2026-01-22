# 死了么 - 项目开发指南

## 项目概述

"死了么"是一个创意签到提醒小程序，核心功能是通过每日签到让紧急联系人知道你还活着。如果连续多天未签到，系统会自动向设置的紧急联系人发送邮件通知。

## 技术架构

### 前端（小程序）
- **框架**: Taro 4.0.5 + React 18
- **样式**: Sass
- **UI组件**: Taro UI
- **工具库**: Moment.js（日期处理）

### 后端（API）
- **框架**: Egg.js 2.x
- **数据库**: MySQL
- **邮件服务**: Nodemailer
- **定时任务**: Egg Schedule

## 核心功能

### 1. 每日签到
- 用户每天点击签到按钮完成打卡
- 记录签到时间和日期
- 计算连续签到天数

### 2. 紧急联系人管理
- 添加/编辑/删除紧急联系人
- 支持多个联系人
- 记录联系人姓名、邮箱、关系

### 3. 自动邮件通知
- 每天定时检查用户签到状态
- 连续N天（默认3天）未签到触发通知
- 向所有紧急联系人发送邮件

### 4. 签到记录统计
- 累计签到天数
- 最长连续签到
- 当前连续签到
- 签到历史记录

### 5. 个性化设置
- 设置未签到天数阈值
- 设置每日提醒时间
- 开启/关闭提醒功能

## 数据库表结构

### checkins（签到记录表）
- id: 主键
- user_id: 用户ID
- checkin_date: 签到日期
- checkin_time: 签到时间
- created_at: 创建时间

### emergency_contacts（紧急联系人表）
- id: 主键
- user_id: 用户ID
- name: 联系人姓名
- email: 联系人邮箱
- relation: 关系
- created_at: 创建时间
- updated_at: 更新时间

### user_settings（用户设置表）
- id: 主键
- user_id: 用户ID
- notify_days: 未签到天数阈值
- reminder_time: 提醒时间
- enable_reminder: 是否启用提醒
- created_at: 创建时间
- updated_at: 更新时间

### notifications（通知记录表）
- id: 主键
- user_id: 用户ID
- type: 通知类型
- content: 通知内容
- created_at: 创建时间

## 邮件配置

在 `program_egg/config/config.default.js` 中配置：

```javascript
config.email = {
  host: 'smtp.qq.com',
  port: 587,
  user: '2685230792@qq.com',
  pass: 'umpazhxrriatddef', // QQ邮箱授权码
  secure: false,
};
```

## 定时任务

### checkMissedCheckins
- **执行时间**: 每天早上9点
- **功能**: 检查所有用户的签到状态，对连续未签到达到阈值的用户发送邮件通知

## API接口

### 签到相关
- GET `/api/checkin/today` - 获取今日签到状态
- POST `/api/checkin/do` - 执行签到
- GET `/api/checkin/records` - 获取签到记录
- GET `/api/checkin/stats` - 获取签到统计

### 联系人相关
- GET `/api/contacts/list` - 获取联系人列表
- POST `/api/contacts/add` - 添加联系人
- PUT `/api/contacts/:id` - 更新联系人
- DELETE `/api/contacts/:id` - 删除联系人

### 设置相关
- GET `/api/settings/get` - 获取用户设置
- POST `/api/settings/update` - 更新用户设置

## 开发流程

### 1. 初始化数据库
```bash
# 在MySQL中执行
mysql -u root -p < program_egg/database/sileme.sql
```

### 2. 启动后端服务
```bash
cd program_egg
pnpm install
pnpm run dev
```

### 3. 启动小程序
```bash
cd sileme
pnpm install
pnpm run dev
```

### 4. 在微信开发者工具中打开
- 选择 `sileme/dist` 目录
- 使用测试AppID或自己的AppID

## 部署说明

### 后端部署
1. 配置生产环境数据库
2. 配置邮件服务
3. 启动服务：`pnpm start`

### 小程序部署
1. 构建生产版本：`pnpm run build`
2. 在微信开发者工具中上传代码
3. 提交审核

## 注意事项

1. **邮箱授权码**: 使用QQ邮箱需要开启SMTP服务并获取授权码
2. **定时任务**: 确保服务器时区设置正确
3. **数据库索引**: 已为常用查询字段添加索引
4. **安全性**: 所有API接口都需要JWT认证

## 扩展功能建议

1. 添加微信模板消息提醒
2. 支持自定义邮件模板
3. 添加签到打卡地点记录
4. 支持签到心情记录
5. 添加好友互相关注功能
6. 签到排行榜
7. 签到奖励机制

## 技术支持

如有问题，请查看：
- Taro文档: https://taro-docs.jd.com
- Egg.js文档: https://www.eggjs.org
- Nodemailer文档: https://nodemailer.com
