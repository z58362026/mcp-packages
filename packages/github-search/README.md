# GitHub 搜索工具

这是一个基于 Model Context Protocol (MCP) 的 GitHub 搜索工具，提供仓库、代码、Issues 和用户的搜索功能。

## 功能特性

- 搜索 GitHub 仓库
- 搜索代码
- 搜索 Issues
- 搜索用户
- 获取用户详细信息

## 环境要求

- Node.js >= 18
- GitHub Personal Access Token (需要 `repo` 和 `read:user` 权限)

## 安装

```bash
pnpm add @mcp/github-search
```

## 配置

在使用之前，需要设置 GitHub Token 环境变量：

```bash
export GITHUB_TOKEN=your_github_token
```

## 使用方法

### 1. 搜索功能 (github_search)

搜索 GitHub 上的内容，支持多种类型：

```typescript
// 示例请求
{
  "name": "github_search",
  "arguments": {
    "query": "typescript",
    "type": "repositories", // 可选值: repositories, code, issues, users
    "page": 1,             // 可选，默认值: 1
    "perPage": 30          // 可选，默认值: 30
  }
}
```

参数说明：

- `query`: 搜索关键词
- `type`: 搜索类型
  - `repositories`: 搜索仓库
  - `code`: 搜索代码
  - `issues`: 搜索 Issues
  - `users`: 搜索用户
- `page`: 当前页码
- `perPage`: 每页结果数量

### 2. 获取用户信息 (get_github_user)

获取指定用户的详细信息：

```typescript
// 示例请求
{
  "name": "get_github_user",
  "arguments": {
    "username": "octocat"
  }
}
```

参数说明：

- `username`: GitHub 用户名

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

## 错误处理

工具会处理以下错误情况：

- GitHub API 错误
- 参数验证错误
- 网络错误

错误响应示例：

```json
{
  "error": "GitHub API 错误: 404 Not Found"
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
```

## 许可证

MIT
