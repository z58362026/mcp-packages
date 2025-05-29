# MCP Packages

这是一个基于 Model Context Protocol (MCP) 的工具包集合，提供了各种实用的工具服务。

## 项目结构

```
mcp-packages/
├── packages/
│   ├── github-search/    # GitHub 搜索工具
│   └── time/            # 时间处理工具
├── scripts/             # 项目脚本
└── ...配置文件
```

## 可用工具包

### 1. GitHub 搜索工具 (github-search)

提供 GitHub 仓库、代码、Issues 和用户的搜索功能。

[详细文档](./packages/github-search/README.md)

### 2. 时间处理工具 (time)

提供时间获取和时区转换功能。

[详细文档](./packages/time/README.md)

## 开发环境要求

- Node.js >= 18
- pnpm >= 8

## 安装

```bash
# 安装依赖
pnpm install
```

## 开发

```bash
# 构建所有包
pnpm build

# 开发模式
pnpm dev
```

## 项目配置

项目使用以下主要配置：

- TypeScript
- ESLint
- Prettier
- Husky (Git hooks)
- Turborepo (构建系统)

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

MIT
