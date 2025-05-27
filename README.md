# MCP Packages

这是一个使用 pnpm 管理的 monorepo 项目。

## 项目结构

```
.
├── apps/          # 应用程序目录
├── packages/      # 共享包目录
├── pnpm-workspace.yaml
└── package.json
```

## 开发环境要求

- Node.js >= 16
- pnpm >= 8

## 安装依赖

```bash
pnpm install
```

## 开发命令

- `pnpm build` - 构建所有包
- `pnpm dev` - 启动开发环境
- `pnpm test` - 运行测试
- `pnpm lint` - 运行代码检查

## 添加新包

1. 在 `packages` 目录下创建新的包目录
2. 在包目录中初始化 `package.json`
3. 在根目录运行 `pnpm install` 更新工作空间

## 添加新应用

1. 在 `apps` 目录下创建新的应用目录
2. 在应用目录中初始化 `package.json`
3. 在根目录运行 `pnpm install` 更新工作空间 