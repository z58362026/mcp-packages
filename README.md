# MCP Packages

这是一个基于 Model Context Protocol (MCP) 的工具包集合，提供了各种实用的工具服务。

## 项目结构

```
mcp-packages/
├── packages/
│   ├── github-search/    # GitHub 搜索工具
│   ├── time/            # 时间处理工具
│   └── feishu/          # 飞书文档分析工具
├── scripts/             # 项目脚本
└── ...配置文件
```

## 可用工具包

### 1. GitHub 搜索工具 (github-search)

提供 GitHub 仓库、代码、Issues 和用户的搜索功能。

[详细文档](./packages/github-search/README.md)

```bash
# 安装 GitHub 搜索工具
pnpm add @z58362026/github-search

# 配置 GitHub Token
export GITHUB_TOKEN=your_github_token

# 测试工具
cd packages/github-search
npx @modelcontextprotocol/inspector node dist/index.cjs.js
```

### 2. 时间处理工具 (time)

提供时间获取和时区转换功能。

[详细文档](./packages/time/README.md)

```bash
# 安装时间处理工具
pnpm add @z58362026/time

# 可选：配置默认时区
export LOCAL_TIMEZONE=Asia/Shanghai

# 测试工具
cd packages/time
npx @modelcontextprotocol/inspector node dist/index.cjs.js
```

### 3. 飞书文档分析工具 (feishu)

提供飞书文档内容获取、需求分析和代码生成功能。

[详细文档](./packages/feishu/README.md)

```bash
# 安装飞书文档分析工具
pnpm add @z58362026/feishu

# 配置飞书应用凭证
export FEISHU_APP_ID=your_app_id
export FEISHU_APP_SECRET=your_app_secret

# 测试工具
cd packages/feishu
npx @modelcontextprotocol/inspector node dist/index.cjs.js
```

## 开发环境要求

- Node.js >= 18
- pnpm >= 8

## 安装

### 1. 安装所有工具包

```bash
# 安装所有依赖
pnpm install

# 构建所有包
pnpm build
```

### 2. 安装单个工具包

```bash
# 安装 GitHub 搜索工具
pnpm add @z58362026/github-search

# 安装时间处理工具
pnpm add @z58362026/time

# 安装飞书文档分析工具
pnpm add @z58362026/feishu
```

## 开发

```bash
# 构建所有包
pnpm build

# 开发模式
pnpm dev

# 清理构建文件
pnpm clean
```

## 测试

每个工具包都可以使用 MCP Inspector 进行测试：

```bash
# 进入工具包目录
cd packages/<package-name>

# 运行测试
npx @modelcontextprotocol/inspector node dist/index.cjs.js
```

测试过程中，Inspector 会提供一个交互式界面，你可以：

- 查看可用的工具列表
- 测试工具功能
- 验证参数验证
- 检查错误处理

## 项目配置

项目使用以下主要配置：

- TypeScript
- ESLint
- Prettier
- Husky (Git hooks)
- Turborepo (构建系统)

### 环境变量配置

每个工具包可能需要特定的环境变量配置：

1. GitHub 搜索工具：

   ```bash
   export GITHUB_TOKEN=your_github_token
   ```

2. 时间处理工具：

   ```bash
   export LOCAL_TIMEZONE=Asia/Shanghai  # 可选
   ```

3. 飞书文档分析工具：
   ```bash
   export FEISHU_APP_ID=your_app_id
   export FEISHU_APP_SECRET=your_app_secret
   ```

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 开发规范

- 使用 TypeScript 编写代码
- 遵循 ESLint 和 Prettier 配置
- 编写单元测试
- 更新相关文档
- 遵循语义化版本规范

## 许可证

MIT
