# 死了么 - 自动登录配置说明

## 已完成的功能

### 1. 数据库表结构
已在 `program_egg/database/sileme.sql` 中创建以下表：
- `user` - 用户表（存储openid）
- `miniprogram_config` - 小程序配置表（存储appid/secret）
- `checkins` - 签到记录表
- `emergency_contacts` - 紧急联系人表
- `user_settings` - 用户设置表
- `notifications` - 通知记录表

### 2. 后端登录接口
- 路由：`POST /api/sileme/login`
- 控制器：`program_egg/app/controller/sileme/login.js`
- 功能：
  - 接收微信code
  - 从数据库读取appid/secret
  - 调用微信API换取openid
  - 自动创建新用户（如果不存在）
  - 生成JWT token返回

### 3. 定时任务
- 文件：`program_egg/app/schedule/sileme/getAccessToken.js`
- 功能：每1.9小时自动刷新微信access_token
- 存储：更新到miniprogram_config表的access_token字段

### 4. 前端自动登录
- 文件：`sileme/src/app.jsx`
- 功能：
  - 应用启动时自动调用wx.login
  - 用code换取token
  - 保存token到本地存储
  - 无需登录页面

## 配置步骤

### 1. 执行数据库脚本
```bash
mysql -u root -p < program_egg/database/sileme.sql
```

### 2. 更新小程序配置
在数据库中更新你的真实appid和secret：
```sql
UPDATE miniprogram_config 
SET appid = '你的真实appid', 
    secret = '你的真实secret' 
WHERE app_name = 'sileme';
```

### 3. 启动后端服务
```bash
cd program_egg
npm run dev
```

### 4. 启动小程序
```bash
cd sileme
npm run dev:weapp
```

### 5. 在微信开发者工具中测试
- 打开微信开发者工具
- 导入项目，选择 `sileme/dist` 目录
- 查看控制台日志，确认自动登录成功

## 工作流程

1. 用户打开小程序
2. `app.jsx` 的 `componentDidMount` 自动执行
3. 检查本地是否有token，有则跳过登录
4. 调用 `wx.login()` 获取code
5. 请求 `/api/sileme/login` 接口，传入code
6. 后端用code换取openid
7. 查询或创建用户记录
8. 生成JWT token返回
9. 前端保存token到本地存储
10. 后续所有API请求都携带这个token

## 注意事项

- 确保数据库配置正确（`program_egg/config/config.default.js`）
- 确保JWT secret已配置
- 小程序appid/secret必须是真实有效的
- 定时任务会自动刷新access_token，无需手动操作
