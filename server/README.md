# 🚀 AI Proxy Server

后端代理服务器，集中管理所有 AI 服务 API Key，让前端无需直接管理！

## 📋 功能

- ✅ OpenAI DALL-E 集成
- ✅ Crate 工作流集成
- ✅ Coze 集成
- ✅ Stable Diffusion 集成
- 🔒 API Key 安全存储在后端
- 🎯 统一的 API 接口

## 🚀 快速开始

### 1. 安装依赖

```bash
cd server
npm install
```

### 2. 配置环境变量

```bash
# 复制示例文件
cp .env.example .env

# 编辑 .env，填入你的 API Key
```

### 3. 启动服务器

```bash
# 开发模式（自动重启）
npm run dev

# 生产模式
npm start
```

服务器将运行在 http://localhost:3000

## 📡 API 接口

### 获取可用服务

```bash
GET /api/services
```

响应示例：
```json
{
  "services": [
    {"id": "openai", "name": "OpenAI DALL-E", "enabled": true},
    {"id": "crate", "name": "Crate 工作流", "enabled": true},
    {"id": "coze", "name": "Coze", "enabled": false},
    {"id": "stable-diffusion", "name": "Stable Diffusion", "enabled": true}
  ]
}
```

### 生成图片（统一接口）

```bash
POST /api/generate
Content-Type: application/json

{
  "service": "crate",
  "prompt": "节日促销 Banner，红色主题，喜庆，购物，电商风格",
  "size": {"width": 343, "height": 72},
  "count": 1
}
```

### 生成图片（单独接口）

```bash
# OpenAI
POST /api/generate/openai

# Crate
POST /api/generate/crate

# Coze
POST /api/generate/coze

# Stable Diffusion
POST /api/generate/stable-diffusion
```

## 🔧 配置说明

在 `.env` 文件中配置你需要的服务：

| 变量 | 说明 | 必填？ |
|------|------|--------|
| `PORT` | 服务器端口 | 否，默认 3000 |
| `OPENAI_API_KEY` | OpenAI API Key | 使用 OpenAI 时必填 |
| `CRATE_API_ENDPOINT` | Crate 工作流 API 地址 | 使用 Crate 时必填 |
| `CRATE_API_KEY` | Crate API Key（如需要） | 否 |
| `COZE_API_KEY` | Coze API Key | 使用 Coze 时必填 |
| `COZE_BOT_ID` | Coze Bot ID | 使用 Coze 时必填 |
| `STABLE_DIFFUSION_ENDPOINT` | Stable Diffusion API 地址 | 使用 SD 时必填 |

## 🎯 下一步

配置好服务器后，记得修改前端代码，让它调用我们的代理服务器而不是直接调用外部 API！
