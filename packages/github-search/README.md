# GitHub Search MCP Server

这是一个用于搜索 GitHub 内容的 MCP 服务器。

## 环境变量配置

在使用此服务器之前，需要设置以下环境变量：

### GITHUB_TOKEN

GitHub Personal Access Token，需要具有以下权限：

- `repo` - 用于访问仓库内容
- `read:user` - 用于读取用户信息

#### 获取 Token 步骤

1. 访问 GitHub 设置：

   - 登录 GitHub
   - 点击右上角头像 -> Settings
   - 左侧菜单滚动到底部，点击 Developer settings
   - 点击 Personal access tokens -> Tokens (classic)
   - 点击 "Generate new token"

2. 配置 Token：

   - Note: 填写一个描述性的名称，如 "MCP GitHub Search"
   - Expiration: 选择过期时间（建议选择适当的期限）
   - Select scopes: 勾选以下权限
     - `repo` (完整权限)
     - `read:user`

3. 生成 Token：
   - 滚动到底部，点击 "Generate token"
   - 复制生成的 token（注意：token 只会显示一次）

#### 设置环境变量

1. 在 `packages/github-search` 目录下创建 `.env` 文件：

   ```bash
   touch packages/github-search/.env
   ```

2. 编辑 `.env` 文件，添加以下内容：

   ```
   # GitHub Personal Access Token 配置
   # ==============================
   # 此 token 用于访问 GitHub API，需要具有以下权限：
   # - repo: 用于访问仓库内容
   # - read:user: 用于读取用户信息
   #
   # 获取 token 步骤：
   # 1. 访问 GitHub Settings -> Developer settings -> Personal access tokens -> Tokens (classic)
   # 2. 点击 "Generate new token"
   # 3. 选择所需权限（repo 和 read:user）
   # 4. 生成并复制 token
   #
   # 注意：请勿将此文件提交到版本控制系统
   # ==============================

   GITHUB_TOKEN=your_github_token_here
   ```

3. 将 `your_github_token_here` 替换为你的实际 token

#### 安全注意事项

- 永远不要将 `.env` 文件提交到版本控制系统
- 定期轮换你的 token
- 使用最小权限原则，只授予必要的权限
- 如果 token 泄露，立即在 GitHub 上撤销它

## 使用方法

1. 安装依赖：

   ```bash
   pnpm install
   ```

2. 运行服务器：
   ```bash
   pnpm start
   ```

## 可用工具

1. `github_search` - 搜索 GitHub 仓库、代码、Issues 或用户
2. `get_github_user` - 获取 GitHub 用户信息
