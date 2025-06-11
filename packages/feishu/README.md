# 飞书文档分析工具

这是一个基于 Model Context Protocol (MCP) 的飞书文档分析工具，提供文档内容获取、需求分析和智能代码生成功能。

## 功能特性

- 获取飞书文档内容
- 集成知识库分析
  - 支持本地知识库
  - 支持远程知识库
- 智能代码生成
  - 基于项目规范生成代码
  - 支持多种项目类型（前端、后端、全栈）
  - 自动生成项目结构
  - 符合团队代码规范

## 环境要求

- Node.js >= 18
- 飞书应用凭证（App ID 和 App Secret）

## 安装

```bash
pnpm add @z58362026/feishu
```

## 配置

### 1. 飞书应用凭证

在使用之前，需要设置飞书应用凭证环境变量：

```bash
export FEISHU_APP_ID=your_app_id
export FEISHU_APP_SECRET=your_app_secret
```

### 2. 知识库配置

#### 本地知识库

创建本地知识库文件（JSON 格式）：

```json
{
  "standards": {
    "naming": {
      "components": "PascalCase",
      "functions": "camelCase",
      "constants": "UPPER_CASE"
    },
    "structure": {
      "frontend": {
        "components": "src/components",
        "services": "src/services",
        "utils": "src/utils"
      },
      "backend": {
        "controllers": "src/controllers",
        "services": "src/services",
        "models": "src/models"
      }
    }
  },
  "templates": {
    "react": {
      "component": "templates/react/component.tsx",
      "service": "templates/react/service.ts"
    },
    "express": {
      "controller": "templates/express/controller.ts",
      "service": "templates/express/service.ts"
    }
  }
}
```

#### 远程知识库

提供远程知识库 API 端点，返回相同格式的 JSON 数据。

## 使用方法

### 1. 获取文档内容 (get_feishu_doc)

获取指定飞书文档的内容：

```typescript
// 示例请求
{
  "name": "get_feishu_doc",
  "arguments": {
    "docToken": "doccnxxxxxxxxxxxxxxxxxxxx"  // 飞书文档的 token
  }
}
```

参数说明：

- `docToken`: 飞书文档的 token（从文档 URL 中获取）

### 2. 分析文档并生成代码 (analyze_doc)

分析文档内容并生成相应的代码：

```typescript
// 示例请求
{
  "name": "analyze_doc",
  "arguments": {
    "docToken": "doccnxxxxxxxxxxxxxxxxxxxx",  // 飞书文档的 token
    "knowledgeBase": {
      "type": "local",                        // 知识库类型：local 或 remote
      "path": "./knowledge-base.json"         // 本地知识库路径
    },
    "projectSpec": {
      "type": "frontend",                     // 项目类型：frontend、backend 或 fullstack
      "framework": "react",                   // 使用的框架
      "structure": {                          // 项目目录结构配置
        "src": "src",
        "test": "tests",
        "docs": "docs"
      },
      "conventions": [                        // 项目规范
        "使用 TypeScript",
        "遵循 ESLint 规则",
        "使用 Prettier 格式化"
      ]
    },
    "outputPath": "./generated"              // 可选，代码输出路径
  }
}
```

参数说明：

- `docToken`: 飞书文档的 token
- `knowledgeBase`: 知识库配置
  - `type`: 知识库类型（local 或 remote）
  - `path`: 本地知识库路径（type 为 local 时必填）
  - `url`: 远程知识库 URL（type 为 remote 时必填）
- `projectSpec`: 项目规范配置
  - `type`: 项目类型
  - `framework`: 使用的框架
  - `structure`: 项目目录结构
  - `conventions`: 项目规范列表
- `outputPath`: 代码输出路径（可选）

## 响应格式

所有响应都遵循 MCP 协议格式：

```typescript
{
  "content": [
    {
      "type": "text",
      "text": "JSON 格式的响应数据"
    }
  ]
}
```

### 响应示例

1. 获取文档内容：

```json
{
  "content": "文档内容..."
}
```

2. 分析文档：

```json
{
  "analysis": {
    "modules": ["用户管理", "权限控制", "数据存储"],
    "requirements": ["RESTful API", "数据库设计", "前端组件"]
  },
  "structure": {
    "src": {
      "components": {},
      "services": {},
      "utils": {}
    },
    "test": {
      "unit": {},
      "integration": {}
    },
    "docs": {
      "api": {},
      "guides": {}
    }
  },
  "code": {
    "components": {},
    "services": {},
    "utils": {}
  }
}
```

## 错误处理

工具会处理以下错误情况：

- 飞书 API 错误
- 参数验证错误
- 文档访问权限错误
- 知识库加载错误
- 代码生成错误

错误响应示例：

```json
{
  "error": "获取文档内容失败: 403 Forbidden"
}
```

## 开发

```bash
# 安装依赖
pnpm install

# 构建
pnpm build

# 开发模式
pnpm dev

# 测试
npx @modelcontextprotocol/inspector node dist/index.cjs.js
```

## 注意事项

1. 文档格式要求：

   - 使用 Markdown 格式编写需求文档
   - 清晰描述功能模块和接口要求
   - 包含必要的业务逻辑说明

2. 知识库维护：

   - 定期更新知识库内容
   - 保持代码模板的最新状态
   - 及时更新项目规范

3. 代码生成：

   - 生成的代码需要根据具体项目需求进行调整
   - 建议在生成后进行代码审查和测试
   - 可能需要根据项目规范进行格式化

4. 安全考虑：
   - 妥善保管飞书应用凭证
   - 定期轮换 App Secret
   - 使用最小权限原则
   - 保护知识库访问权限

## 许可证

MIT
